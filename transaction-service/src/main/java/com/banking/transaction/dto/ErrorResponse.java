package com.banking.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private boolean success = false;
    private String message;
    private List<FieldError> errors;

    public ErrorResponse(String message) {
        this.message = message;
        this.errors = new ArrayList<>();
    }

    public ErrorResponse(String message, List<FieldError> errors) {
        this.message = message;
        this.errors = errors;
    }

    public void addError(String field, String errorMessage) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(new FieldError(field, errorMessage));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
    }
}
