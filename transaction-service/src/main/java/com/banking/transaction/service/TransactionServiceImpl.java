package com.banking.transaction.service;

import com.banking.transaction.dto.*;
import com.banking.transaction.entity.Transaction;
import com.banking.transaction.entity.TxnVoidLog;
import com.banking.transaction.exception.*;
import com.banking.transaction.repository.TransactionRepository;
import com.banking.transaction.repository.TxnVoidLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TxnVoidLogRepository voidLogRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.account.base-url}")
    private String accountServiceUrl;

    @Override
    public TransactionResponse createTransaction(TransactionRequest request) {
        // 1. Validate account exists and is ACTIVE
        validateAccount(request.getAccountId());

        // 2. For DEBIT, check sufficient balance
        if ("DEBIT".equals(request.getType())) {
            checkSufficientBalance(request.getAccountId(), request.getAmount());
        }

        // 3. Create transaction
        Transaction transaction = new Transaction();
        transaction.setAccountId(request.getAccountId());
        transaction.setAmount(request.getAmount());
        transaction.setTxnType(Transaction.TransactionType.valueOf(request.getType()));
        transaction.setDescription(request.getDescription());
        transaction.setCategory(request.getCategory());
        transaction.setStatus(Transaction.TransactionStatus.POSTED);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // 4. Update account balance
        updateAccountBalance(request.getAccountId(),
                            calculateDelta(request.getType(), request.getAmount()),
                            savedTransaction.getTransactionId().toString());

        return TransactionResponse.fromEntity(savedTransaction);
    }

    @Override
    public PagedResponse<TransactionResponse> getAllTransactions(
            Long accountId, int page, int limit,
            LocalDateTime fromDate, LocalDateTime toDate) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "txnDate"));

        Page<Transaction> transactionPage;
        if (accountId != null && (fromDate != null || toDate != null)) {
            transactionPage = transactionRepository.findByAccountIdAndDateRange(
                accountId, fromDate, toDate, pageable);
        } else if (accountId != null) {
            transactionPage = transactionRepository.findByAccountId(accountId, pageable);
        } else {
            transactionPage = transactionRepository.findAll(pageable);
        }

        List<TransactionResponse> transactions = transactionPage.getContent()
                .stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(transactions, transactionPage.getTotalElements(), page, limit);
    }

    @Override
    public TransactionResponse getTransactionById(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));

        return TransactionResponse.fromEntity(transaction);
    }

    @Override
    public TransactionResponse updateTransaction(Long transactionId, TransactionUpdateRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));

        // Cannot update voided transactions
        if (transaction.getStatus() == Transaction.TransactionStatus.VOIDED) {
            throw new BusinessRuleException("Cannot update voided transaction");
        }

        // Only description and category can be updated
        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            transaction.setCategory(request.getCategory());
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(updatedTransaction);
    }

    @Override
    public TransactionResponse voidTransaction(Long transactionId, VoidRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));

        // Check if already voided
        if (transaction.getStatus() == Transaction.TransactionStatus.VOIDED) {
            throw new BusinessRuleException("Transaction is already voided");
        }

        // Reverse the balance
        BigDecimal reverseDelta = calculateDelta(
            transaction.getTxnType() == Transaction.TransactionType.DEBIT ? "CREDIT" : "DEBIT",
            transaction.getAmount()
        );

        updateAccountBalance(transaction.getAccountId(), reverseDelta,
                           "VOID-" + transactionId);

        // Update transaction status
        transaction.setStatus(Transaction.TransactionStatus.VOIDED);
        Transaction voidedTransaction = transactionRepository.save(transaction);

        // Log the void
        TxnVoidLog voidLog = new TxnVoidLog();
        voidLog.setTransactionId(transactionId);
        voidLog.setVoidReason(request.getVoidReason());
        voidLog.setVoidedBy("SYSTEM");
        voidLogRepository.save(voidLog);

        return TransactionResponse.fromEntity(voidedTransaction);
    }

    @SuppressWarnings("unchecked")
    private void validateAccount(Long accountId) {
        try {
            String url = accountServiceUrl + "/accounts/" + accountId + "/balance";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("data")) {
                throw new AccountValidationException("Account not found");
            }

            Map<String, Object> data = (Map<String, Object>) response.get("data");
            String status = (String) data.get("status");

            if (!"ACTIVE".equals(status)) {
                throw new AccountValidationException("Account is not active: " + status);
            }
        } catch (AccountValidationException e) {
            throw e;
        } catch (Exception e) {
            throw new AccountValidationException(
                "Account validation failed: " + e.getMessage()
            );
        }
    }

    @SuppressWarnings("unchecked")
    private void checkSufficientBalance(Long accountId, BigDecimal amount) {
        try {
            String url = accountServiceUrl + "/accounts/" + accountId + "/balance";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            Map<String, Object> data = (Map<String, Object>) response.get("data");
            BigDecimal balance = new BigDecimal(data.get("balance").toString());

            if (balance.compareTo(amount) < 0) {
                throw new BusinessRuleException("Insufficient funds");
            }
        } catch (BusinessRuleException e) {
            throw e;
        } catch (Exception e) {
            throw new AccountValidationException(
                "Failed to check balance: " + e.getMessage()
            );
        }
    }

    private void updateAccountBalance(Long accountId, BigDecimal delta, String txnId) {
        try {
            String url = accountServiceUrl + "/accounts/" + accountId + "/balance";

            Map<String, Object> request = new HashMap<>();
            request.put("delta", delta);
            request.put("transactionId", txnId);

            // Use exchange() with PATCH method
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request);

            restTemplate.exchange(url, HttpMethod.PATCH, entity, Map.class);
        } catch (Exception e) {
            throw new BusinessRuleException(
                "Failed to update account balance: " + e.getMessage()
            );
        }
    }

    private BigDecimal calculateDelta(String type, BigDecimal amount) {
        return "DEBIT".equals(type) ? amount.negate() : amount;
    }
}
