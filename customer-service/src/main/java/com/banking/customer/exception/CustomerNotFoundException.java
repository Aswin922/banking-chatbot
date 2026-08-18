package com.banking.customer.exception;

public class CustomerNotFoundException extends RuntimeException {

    public CustomerNotFoundException(String message) {
        super(message);
    }

    public CustomerNotFoundException(Long customerId) {
        super("Customer not found with ID: " + customerId);
    }
}
