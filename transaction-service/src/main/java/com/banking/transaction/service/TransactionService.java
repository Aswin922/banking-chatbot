package com.banking.transaction.service;

import com.banking.transaction.dto.*;
import java.time.LocalDateTime;

public interface TransactionService {

    TransactionResponse createTransaction(TransactionRequest request);

    PagedResponse<TransactionResponse> getAllTransactions(
        Long accountId, int page, int limit,
        LocalDateTime fromDate, LocalDateTime toDate
    );

    TransactionResponse getTransactionById(Long transactionId);

    TransactionResponse updateTransaction(Long transactionId, TransactionUpdateRequest request);

    TransactionResponse voidTransaction(Long transactionId, VoidRequest request);
}
