package com.banking.customer.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9\\-\\s\\(\\)\\+]+$", message = "Phone must contain only digits and formatting characters")
    @Size(min = 7, max = 30, message = "Phone must be between 7 and 30 characters")
    private String phone;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;
}
