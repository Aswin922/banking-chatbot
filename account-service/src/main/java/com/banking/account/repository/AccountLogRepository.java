package com.banking.account.repository;

import com.banking.account.entity.AccountLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AccountLogRepository extends JpaRepository<AccountLog, Long> {

    List<AccountLog> findByAccountIdOrderByChangedAtDesc(Long accountId);
}
