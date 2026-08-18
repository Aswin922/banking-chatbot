package com.banking.account.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Account type is required")
    @Pattern(regexp = "SAVINGS|CHECKING|FIXED", message = "Account type must be SAVINGS, CHECKING, or FIXED")
    private String accountType;

    @NotNull(message = "Initial deposit is required")
    @DecimalMin(value = "0.0", message = "Initial deposit must be non-negative")
    private BigDecimal initialDeposit;
}
