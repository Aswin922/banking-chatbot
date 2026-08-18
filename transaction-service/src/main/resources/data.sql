-- Seed data for transaction table (100 transactions across 50 accounts)
-- Note: Balances should match those in account-service seed data

-- Account 1 (Balance: 2500.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(1, 5000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(1, 1500.00, 'DEBIT', 'Rent Payment', 'PAYMENT', 'POSTED'),
(1, 1000.00, 'DEBIT', 'Groceries', 'SHOPPING', 'POSTED');

-- Account 2 (Balance: 15000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(2, 20000.00, 'CREDIT', 'Salary', 'INCOME', 'POSTED'),
(2, 5000.00, 'DEBIT', 'Investment', 'TRANSFER', 'POSTED');

-- Account 3 (Balance: 50000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(3, 50000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED');

-- Account 4 (Balance: 3200.50)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(4, 5000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(4, 1799.50, 'DEBIT', 'Shopping', 'SHOPPING', 'POSTED');

-- Account 5 (Balance: 22000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(5, 22000.00, 'CREDIT', 'Savings Transfer', 'TRANSFER', 'POSTED');

-- Account 6 (Balance: 1800.75)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(6, 3000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(6, 1199.25, 'DEBIT', 'Utilities', 'BILL', 'POSTED');

-- Account 7 (Balance: 8500.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(7, 10000.00, 'CREDIT', 'Bonus', 'INCOME', 'POSTED'),
(7, 1500.00, 'DEBIT', 'Home Repairs', 'PAYMENT', 'POSTED');

-- Account 8 (Balance: 100000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(8, 100000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED');

-- Account 9 (Balance: 4500.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(9, 5000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(9, 500.00, 'DEBIT', 'ATM Withdrawal', 'WITHDRAWAL', 'POSTED');

-- Account 10 (Balance: 18000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(10, 20000.00, 'CREDIT', 'Transfer from Checking', 'TRANSFER', 'POSTED'),
(10, 2000.00, 'DEBIT', 'Investment', 'TRANSFER', 'POSTED');

-- Account 11 (Balance: 2200.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(11, 3000.00, 'CREDIT', 'Freelance Payment', 'INCOME', 'POSTED'),
(11, 800.00, 'DEBIT', 'Credit Card Payment', 'PAYMENT', 'POSTED');

-- Account 12 (Balance: 12000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(12, 12000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED');

-- Account 13 (Balance: 75000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(13, 75000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED');

-- Account 14 (Balance: 3800.25)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(14, 4000.00, 'CREDIT', 'Salary', 'INCOME', 'POSTED'),
(14, 199.75, 'DEBIT', 'Phone Bill', 'BILL', 'POSTED');

-- Account 15 (Balance: 25000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(15, 25000.00, 'CREDIT', 'Year End Bonus', 'INCOME', 'POSTED');

-- Account 16 (Balance: 1500.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(16, 2000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(16, 500.00, 'DEBIT', 'Dining', 'FOOD', 'POSTED');

-- Account 17 (Balance: 9500.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(17, 10000.00, 'CREDIT', 'Savings Transfer', 'TRANSFER', 'POSTED'),
(17, 500.00, 'DEBIT', 'Subscription', 'BILL', 'POSTED');

-- Account 18 (Balance: 60000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(18, 60000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED');

-- Account 19 (Balance: 5200.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(19, 6000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(19, 800.00, 'DEBIT', 'Shopping', 'SHOPPING', 'POSTED');

-- Account 20 (Balance: 30000.00)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(20, 30000.00, 'CREDIT', 'Savings Deposit', 'DEPOSIT', 'POSTED');

-- Continue with more accounts (21-40)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(21, 3000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(22, 16000.00, 'CREDIT', 'Savings Deposit', 'DEPOSIT', 'POSTED'),
(23, 85000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED'),
(24, 5000.00, 'CREDIT', 'Salary', 'INCOME', 'POSTED'),
(25, 20000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(26, 4000.00, 'CREDIT', 'Freelance', 'INCOME', 'POSTED'),
(27, 14000.00, 'CREDIT', 'Bonus', 'INCOME', 'POSTED'),
(28, 70000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED'),
(29, 3500.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(30, 11000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(31, 4000.00, 'CREDIT', 'Paycheck', 'INCOME', 'POSTED'),
(32, 19000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(33, 2500.00, 'CREDIT', 'Freelance', 'INCOME', 'POSTED'),
(34, 13000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(35, 55000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED'),
(36, 5000.00, 'CREDIT', 'Salary', 'INCOME', 'POSTED'),
(37, 27000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(38, 3500.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(39, 17000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(40, 90000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED');

-- Accounts 41-50
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(41, 3000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(42, 15500.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(43, 4500.00, 'CREDIT', 'Paycheck', 'INCOME', 'POSTED'),
(44, 21000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(45, 1000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(45, 1000.00, 'DEBIT', 'Withdrawal Before Close', 'WITHDRAWAL', 'POSTED'),
(46, 6000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(47, 35000.00, 'CREDIT', 'Savings', 'DEPOSIT', 'POSTED'),
(48, 120000.00, 'CREDIT', 'Fixed Deposit', 'DEPOSIT', 'POSTED'),
(49, 2000.00, 'CREDIT', 'Initial Deposit', 'DEPOSIT', 'POSTED'),
(49, 800.00, 'DEBIT', 'Suspicious Activity', 'WITHDRAWAL', 'VOIDED'),
(50, 8000.00, 'CREDIT', 'Savings Deposit', 'DEPOSIT', 'POSTED');

-- Additional transactions for variety (mixed accounts)
INSERT INTO transaction (account_id, amount, txn_type, description, category, status) VALUES
(1, 200.00, 'DEBIT', 'Gas Station', 'TRANSPORT', 'POSTED'),
(4, 150.00, 'DEBIT', 'Restaurant', 'FOOD', 'POSTED'),
(6, 300.00, 'CREDIT', 'Refund', 'OTHER', 'POSTED'),
(11, 100.00, 'DEBIT', 'Online Shopping', 'SHOPPING', 'POSTED'),
(14, 250.00, 'DEBIT', 'Doctor Visit', 'HEALTH', 'POSTED'),
(16, 75.00, 'DEBIT', 'Coffee Shop', 'FOOD', 'POSTED'),
(19, 400.00, 'DEBIT', 'Gym Membership', 'HEALTH', 'POSTED'),
(21, 600.00, 'DEBIT', 'Car Insurance', 'BILL', 'POSTED'),
(24, 180.00, 'DEBIT', 'Internet Bill', 'BILL', 'POSTED'),
(26, 220.00, 'DEBIT', 'Electricity', 'BILL', 'POSTED'),
(29, 350.00, 'DEBIT', 'Clothing', 'SHOPPING', 'POSTED'),
(31, 280.00, 'DEBIT', 'Electronics', 'SHOPPING', 'POSTED'),
(33, 190.00, 'DEBIT', 'Books', 'EDUCATION', 'POSTED'),
(36, 420.00, 'DEBIT', 'Furniture', 'SHOPPING', 'POSTED'),
(38, 160.00, 'DEBIT', 'Pet Supplies', 'OTHER', 'POSTED'),
(41, 290.00, 'DEBIT', 'Pharmacy', 'HEALTH', 'POSTED'),
(43, 170.00, 'DEBIT', 'Streaming Services', 'ENTERTAINMENT', 'POSTED'),
(46, 320.00, 'DEBIT', 'Home Decor', 'SHOPPING', 'POSTED');

-- Sample voided transaction log entry
INSERT INTO txn_void_log (transaction_id, void_reason, voided_by) VALUES
((SELECT transaction_id FROM transaction WHERE account_id = 49 AND status = 'VOIDED' LIMIT 1),
 'Fraudulent transaction detected', 'SYSTEM');
