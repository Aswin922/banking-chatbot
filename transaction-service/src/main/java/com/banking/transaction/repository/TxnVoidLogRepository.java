package com.banking.transaction.repository;

import com.banking.transaction.entity.TxnVoidLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TxnVoidLogRepository extends JpaRepository<TxnVoidLog, Long> {

    List<TxnVoidLog> findByTransactionIdOrderByVoidedAtDesc(Long transactionId);
}
