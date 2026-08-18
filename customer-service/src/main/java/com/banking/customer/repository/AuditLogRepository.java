package com.banking.customer.repository;

import com.banking.customer.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByCustomerIdOrderByChangedAtDesc(Long customerId);
}
