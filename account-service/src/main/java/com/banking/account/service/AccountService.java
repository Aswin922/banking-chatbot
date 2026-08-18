package com.banking.account.service;

import com.banking.account.dto.*;
import java.math.BigDecimal;

public interface AccountService {

    AccountResponse createAccount(AccountRequest request);

    PagedResponse<AccountResponse> getAllAccounts(int page, int limit, Long customerId);

    AccountResponse getAccountById(Long accountId);

    AccountResponse updateAccount(Long accountId, AccountUpdateRequest request);

    AccountResponse deleteAccount(Long accountId);

    // Internal methods for transaction-service
    BalanceResponse getBalance(Long accountId);

    BalanceResponse updateBalance(Long accountId, BalanceUpdateRequest request);
}
