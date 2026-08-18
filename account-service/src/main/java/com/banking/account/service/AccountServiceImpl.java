package com.banking.account.service;

import com.banking.account.dto.*;
import com.banking.account.entity.Account;
import com.banking.account.entity.AccountLog;
import com.banking.account.exception.AccountNotFoundException;
import com.banking.account.exception.BusinessRuleException;
import com.banking.account.exception.CustomerValidationException;
import com.banking.account.repository.AccountLogRepository;
import com.banking.account.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountLogRepository accountLogRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.customer.base-url}")
    private String customerServiceUrl;

    private final Random random = new Random();

    @Override
    public AccountResponse createAccount(AccountRequest request) {
        // Validate customer exists and is active
        validateCustomer(request.getCustomerId());

        // Create new account
        Account account = new Account();
        account.setCustomerId(request.getCustomerId());
        account.setAccountNumber(generateAccountNumber());
        account.setAccountType(Account.AccountType.valueOf(request.getAccountType()));
        account.setBalance(request.getInitialDeposit());
        account.setStatus(Account.AccountStatus.ACTIVE);

        Account savedAccount = accountRepository.save(account);

        // Log the creation
        createAuditLog(savedAccount.getAccountId(), AccountLog.AuditAction.CREATE,
                       null, savedAccount.getStatus().name());

        return AccountResponse.fromEntity(savedAccount);
    }

    @Override
    public PagedResponse<AccountResponse> getAllAccounts(int page, int limit, Long customerId) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "openedDate"));

        Page<Account> accountPage;
        if (customerId != null) {
            accountPage = accountRepository.findByCustomerId(customerId, pageable);
        } else {
            accountPage = accountRepository.findAll(pageable);
        }

        List<AccountResponse> accounts = accountPage.getContent()
                .stream()
                .map(AccountResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(accounts, accountPage.getTotalElements(), page, limit);
    }

    @Override
    public AccountResponse getAccountById(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        return AccountResponse.fromEntity(account);
    }

    @Override
    public AccountResponse updateAccount(Long accountId, AccountUpdateRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        String oldStatus = account.getStatus().name();

        // Update account type if provided
        if (request.getAccountType() != null && !request.getAccountType().isEmpty()) {
            account.setAccountType(Account.AccountType.valueOf(request.getAccountType()));
        }

        // Update status if provided
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            account.setStatus(Account.AccountStatus.valueOf(request.getStatus()));
        }

        Account updatedAccount = accountRepository.save(account);

        // Log the update
        createAuditLog(updatedAccount.getAccountId(), AccountLog.AuditAction.UPDATE,
                       oldStatus, updatedAccount.getStatus().name());

        return AccountResponse.fromEntity(updatedAccount);
    }

    @Override
    public AccountResponse deleteAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        // Check if balance is zero
        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessRuleException(
                String.format("Cannot close: balance is $%.2f, must be withdrawn first",
                             account.getBalance())
            );
        }

        String oldStatus = account.getStatus().name();

        // Soft close - set status to CLOSED
        account.setStatus(Account.AccountStatus.CLOSED);
        Account closedAccount = accountRepository.save(account);

        // Log the closure
        createAuditLog(closedAccount.getAccountId(), AccountLog.AuditAction.CLOSE,
                       oldStatus, closedAccount.getStatus().name());

        return AccountResponse.fromEntity(closedAccount);
    }

    @Override
    public BalanceResponse getBalance(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        return new BalanceResponse(
            account.getAccountId(),
            account.getBalance(),
            account.getStatus().name()
        );
    }

    @Override
    public BalanceResponse updateBalance(Long accountId, BalanceUpdateRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        // Check account is active
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BusinessRuleException("Account is not active: " + account.getStatus());
        }

        // Apply delta
        BigDecimal newBalance = account.getBalance().add(request.getDelta());

        // Prevent negative balance
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Insufficient funds");
        }

        account.setBalance(newBalance);
        Account updatedAccount = accountRepository.save(account);

        return new BalanceResponse(
            updatedAccount.getAccountId(),
            updatedAccount.getBalance(),
            updatedAccount.getStatus().name()
        );
    }

    private void validateCustomer(Long customerId) {
        try {
            String url = customerServiceUrl + "/customers/" + customerId;
            // Call customer-service to validate customer exists and is active
            // This will throw an exception if customer doesn't exist or service is unreachable
            restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            throw new CustomerValidationException(
                "Customer validation failed: Customer ID " + customerId + " does not exist or is not active"
            );
        }
    }

    private String generateAccountNumber() {
        // Generate unique account number: ACC-XXXX (4-digit random)
        String accountNumber;
        do {
            int randomNum = 1000 + random.nextInt(9000); // 4-digit number
            accountNumber = "ACC-" + randomNum;
        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }

    private void createAuditLog(Long accountId, AccountLog.AuditAction action,
                                String oldStatus, String newStatus) {
        AccountLog auditLog = new AccountLog();
        auditLog.setAccountId(accountId);
        auditLog.setAction(action);
        auditLog.setOldStatus(oldStatus);
        auditLog.setNewStatus(newStatus);
        auditLog.setChangedBy("SYSTEM"); // In a real app, get from security context

        accountLogRepository.save(auditLog);
    }
}
