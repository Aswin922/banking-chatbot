package com.banking.transaction.exception;

public class AccountValidationException extends RuntimeException {

    public AccountValidationException(String message) {
        super(message);
    }
}
