package com.banking.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoidRequest {

    @NotBlank(message = "Void reason is required")
    private String voidReason;
}
