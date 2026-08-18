package com.banking.transaction.repository;

import com.banking.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByAccountId(Long accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.accountId = :accountId " +
           "AND (:fromDate IS NULL OR t.txnDate >= :fromDate) " +
           "AND (:toDate IS NULL OR t.txnDate <= :toDate)")
    Page<Transaction> findByAccountIdAndDateRange(
        @Param("accountId") Long accountId,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );
}
