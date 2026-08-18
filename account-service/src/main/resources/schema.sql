-- Account Service Schema

CREATE TABLE IF NOT EXISTS account (
  account_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id     BIGINT NOT NULL,
  account_number  VARCHAR(30) NOT NULL UNIQUE,
  account_type    VARCHAR(20) NOT NULL,
  balance         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  opened_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_log (
  log_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_id  BIGINT NOT NULL,
  action      VARCHAR(20) NOT NULL,
  old_status  VARCHAR(20),
  new_status  VARCHAR(20),
  changed_by  VARCHAR(100),
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(account_id)
);

-- Indexes will be created by Hibernate based on entity annotations
-- If you need to create them manually, remove the comments below:
-- CREATE INDEX idx_account_customer_id ON account(customer_id);
-- CREATE INDEX idx_account_number ON account(account_number);
-- CREATE INDEX idx_account_status ON account(status);
-- CREATE INDEX idx_account_log_account_id ON account_log(account_id);
