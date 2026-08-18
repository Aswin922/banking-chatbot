package com.banking.transaction.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotBlank(message = "Transaction type is required")
    @Pattern(regexp = "DEBIT|CREDIT", message = "Transaction type must be DEBIT or CREDIT")
    private String type;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;
}
