package com.banking.account.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "account_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private AuditAction action;

    @Column(name = "old_status", length = 20)
    private String oldStatus;

    @Column(name = "new_status", length = 20)
    private String newStatus;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @CreationTimestamp
    @Column(name = "changed_at")
    private LocalDateTime changedAt;

    public enum AuditAction {
        CREATE, UPDATE, CLOSE
    }
}
