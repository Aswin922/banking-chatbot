package com.banking.account.controller;

import com.banking.account.dto.*;
import com.banking.account.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounts")
@Tag(name = "Account Management", description = "APIs for managing bank accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping
    @Operation(summary = "Create a new account", description = "Creates a new bank account for a customer")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(@Valid @RequestBody AccountRequest request) {
        AccountResponse response = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Account created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all accounts", description = "Retrieves a paginated list of accounts, optionally filtered by customer ID")
    public ResponseEntity<ApiResponse<PagedResponse<AccountResponse>>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long customerId) {
        PagedResponse<AccountResponse> response = accountService.getAllAccounts(page, limit, customerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID", description = "Retrieves a single account by its ID")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(@PathVariable("id") Long accountId) {
        AccountResponse response = accountService.getAccountById(accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account", description = "Updates an existing account's type or status")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable("id") Long accountId,
            @Valid @RequestBody AccountUpdateRequest request) {
        AccountResponse response = accountService.updateAccount(accountId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Account updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Close account", description = "Soft closes an account (sets status to CLOSED), balance must be zero")
    public ResponseEntity<ApiResponse<AccountResponse>> deleteAccount(@PathVariable("id") Long accountId) {
        AccountResponse response = accountService.deleteAccount(accountId);
        return ResponseEntity.ok(ApiResponse.success(response, "Account closed successfully"));
    }

    // Internal endpoints for transaction-service

    @GetMapping("/{id}/balance")
    @Operation(summary = "Get account balance", description = "Internal endpoint: Get current balance and status")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(@PathVariable("id") Long accountId) {
        BalanceResponse response = accountService.getBalance(accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/balance")
    @Operation(summary = "Update account balance", description = "Internal endpoint: Apply a delta to the account balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> updateBalance(
            @PathVariable("id") Long accountId,
            @Valid @RequestBody BalanceUpdateRequest request) {
        BalanceResponse response = accountService.updateBalance(accountId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Balance updated successfully"));
    }
}
