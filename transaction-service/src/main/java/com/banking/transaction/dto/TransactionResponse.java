package com.banking.transaction.dto;

import com.banking.transaction.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long transactionId;
    private Long accountId;
    private LocalDateTime txnDate;
    private BigDecimal amount;
    private String txnType;
    private String description;
    private String category;
    private String status;
    private LocalDateTime createdAt;

    public static TransactionResponse fromEntity(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setTransactionId(transaction.getTransactionId());
        response.setAccountId(transaction.getAccountId());
        response.setTxnDate(transaction.getTxnDate());
        response.setAmount(transaction.getAmount());
        response.setTxnType(transaction.getTxnType().name());
        response.setDescription(transaction.getDescription());
        response.setCategory(transaction.getCategory());
        response.setStatus(transaction.getStatus().name());
        response.setCreatedAt(transaction.getCreatedAt());
        return response;
    }
}
