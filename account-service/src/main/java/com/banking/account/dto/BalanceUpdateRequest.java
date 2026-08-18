package com.banking.account.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BalanceUpdateRequest {

    @NotNull(message = "Delta amount is required")
    private BigDecimal delta;

    private String transactionId;
}
