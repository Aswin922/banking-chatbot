package com.banking.customer.controller;

import com.banking.customer.dto.ApiResponse;
import com.banking.customer.dto.CustomerRequest;
import com.banking.customer.dto.CustomerResponse;
import com.banking.customer.dto.PagedResponse;
import com.banking.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
@Tag(name = "Customer Management", description = "APIs for managing customer records")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create a new customer", description = "Creates a new customer with the provided details")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Customer created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all customers", description = "Retrieves a paginated list of customers with optional search")
    public ResponseEntity<ApiResponse<PagedResponse<CustomerResponse>>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search) {
        PagedResponse<CustomerResponse> response = customerService.getAllCustomers(page, limit, search);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", description = "Retrieves a single customer by their ID")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable("id") Long customerId) {
        CustomerResponse response = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Updates an existing customer's details")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable("id") Long customerId,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.updateCustomer(customerId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer", description = "Soft deletes a customer (sets status to INACTIVE)")
    public ResponseEntity<ApiResponse<CustomerResponse>> deleteCustomer(@PathVariable("id") Long customerId) {
        CustomerResponse response = customerService.deleteCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer deactivated successfully"));
    }
}
