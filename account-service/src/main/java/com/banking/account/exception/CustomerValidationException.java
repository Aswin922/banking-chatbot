package com.banking.account.exception;

public class CustomerValidationException extends RuntimeException {

    public CustomerValidationException(String message) {
        super(message);
    }
}
