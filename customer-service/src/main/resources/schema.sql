-- Customer Service Schema

CREATE TABLE IF NOT EXISTS customer (
  customer_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(30)  NOT NULL,
  address       VARCHAR(255),
  status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
  log_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id   BIGINT NOT NULL,
  action        VARCHAR(20) NOT NULL,
  changed_by    VARCHAR(100),
  changed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_values    JSON,
  new_values    JSON,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Indexes will be created by Hibernate based on entity annotations
-- If you need to create them manually, remove the comments below:
-- CREATE INDEX idx_customer_email ON customer(email);
-- CREATE INDEX idx_customer_status ON customer(status);
-- CREATE INDEX idx_audit_customer_id ON audit_log(customer_id);
