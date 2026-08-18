package com.banking.account.repository;

import com.banking.account.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    boolean existsByAccountNumber(String accountNumber);

    Page<Account> findByCustomerId(Long customerId, Pageable pageable);

    long countByCustomerIdAndStatus(Long customerId, Account.AccountStatus status);
}
