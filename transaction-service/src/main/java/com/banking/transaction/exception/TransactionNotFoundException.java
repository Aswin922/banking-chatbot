package com.banking.transaction.exception;

public class TransactionNotFoundException extends RuntimeException {

    public TransactionNotFoundException(String message) {
        super(message);
    }

    public TransactionNotFoundException(Long transactionId) {
        super("Transaction not found with ID: " + transactionId);
    }
}
