package com.banking.customer.dto;

import com.banking.customer.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long customerId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String status;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public static CustomerResponse fromEntity(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setCustomerId(customer.getCustomerId());
        response.setName(customer.getName());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setAddress(customer.getAddress());
        response.setStatus(customer.getStatus().name());
        response.setCreatedDate(customer.getCreatedDate());
        response.setUpdatedDate(customer.getUpdatedDate());
        return response;
    }
}
