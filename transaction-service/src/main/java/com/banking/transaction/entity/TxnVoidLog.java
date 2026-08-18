package com.banking.transaction.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "txn_void_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TxnVoidLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "void_id")
    private Long voidId;

    @Column(name = "transaction_id", nullable = false)
    private Long transactionId;

    @Column(name = "void_reason", nullable = false, length = 255)
    private String voidReason;

    @Column(name = "voided_by", length = 100)
    private String voidedBy;

    @CreationTimestamp
    @Column(name = "voided_at")
    private LocalDateTime voidedAt;

    @Column(name = "reversal_txn_id")
    private Long reversalTxnId;
}
