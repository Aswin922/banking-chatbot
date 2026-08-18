package com.banking.transaction.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionUpdateRequest {

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;
}
