package com.banking.transaction.controller;

import com.banking.transaction.dto.*;
import com.banking.transaction.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transaction Management", description = "APIs for managing transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    @Operation(summary = "Create transaction", description = "Creates a new debit or credit transaction")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Transaction created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get transactions", description = "Retrieves transactions with optional filters")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getAllTransactions(
            @RequestParam Long accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        PagedResponse<TransactionResponse> response = transactionService.getAllTransactions(
            accountId, page, limit, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID", description = "Retrieves a single transaction")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(
            @PathVariable("id") Long transactionId) {
        TransactionResponse response = transactionService.getTransactionById(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction", description = "Updates description/category only")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable("id") Long transactionId,
            @Valid @RequestBody TransactionUpdateRequest request) {
        TransactionResponse response = transactionService.updateTransaction(transactionId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Transaction updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Void transaction", description = "Voids a transaction and reverses balance")
    public ResponseEntity<ApiResponse<TransactionResponse>> voidTransaction(
            @PathVariable("id") Long transactionId,
            @Valid @RequestBody VoidRequest request) {
        TransactionResponse response = transactionService.voidTransaction(transactionId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Transaction voided successfully"));
    }
}
