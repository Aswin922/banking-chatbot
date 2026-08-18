package com.banking.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.banking.account.entity.Account;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

    private Long accountId;
    private Long customerId;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String status;
    private LocalDateTime openedDate;
    private LocalDateTime updatedDate;

    public static AccountResponse fromEntity(Account account) {
        AccountResponse response = new AccountResponse();
        response.setAccountId(account.getAccountId());
        response.setCustomerId(account.getCustomerId());
        response.setAccountNumber(account.getAccountNumber());
        response.setAccountType(account.getAccountType().name());
        response.setBalance(account.getBalance());
        response.setStatus(account.getStatus().name());
        response.setOpenedDate(account.getOpenedDate());
        response.setUpdatedDate(account.getUpdatedDate());
        return response;
    }
}
