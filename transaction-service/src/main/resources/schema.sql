-- Transaction Service Schema

CREATE TABLE IF NOT EXISTS transaction (
  transaction_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_id      BIGINT NOT NULL,
  txn_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount          DECIMAL(15,2) NOT NULL,
  txn_type        VARCHAR(10) NOT NULL,
  description     VARCHAR(255),
  category        VARCHAR(50),
  status          VARCHAR(10) NOT NULL DEFAULT 'POSTED',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS txn_void_log (
  void_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_id    BIGINT NOT NULL,
  void_reason       VARCHAR(255) NOT NULL,
  voided_by         VARCHAR(100),
  voided_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reversal_txn_id   BIGINT,
  FOREIGN KEY (transaction_id) REFERENCES transaction(transaction_id)
);

-- Indexes will be created by Hibernate based on entity annotations
-- If you need to create them manually, remove the comments below:
-- CREATE INDEX idx_transaction_account_id ON transaction(account_id);
-- CREATE INDEX idx_transaction_txn_date ON transaction(txn_date);
-- CREATE INDEX idx_transaction_status ON transaction(status);
-- CREATE INDEX idx_void_log_transaction_id ON txn_void_log(transaction_id);
