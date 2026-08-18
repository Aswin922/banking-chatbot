package com.banking.account.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountUpdateRequest {

    @Pattern(regexp = "SAVINGS|CHECKING|FIXED", message = "Account type must be SAVINGS, CHECKING, or FIXED")
    private String accountType;

    @Pattern(regexp = "ACTIVE|CLOSED|FROZEN", message = "Status must be ACTIVE, CLOSED, or FROZEN")
    private String status;
}
