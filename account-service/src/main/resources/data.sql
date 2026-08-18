-- Seed data for account table (50 accounts for 20 customers)

INSERT INTO account (customer_id, account_number, account_type, balance, status) VALUES
-- Customer 1 (John Smith) - 3 accounts
(1, 'ACC-1001', 'CHECKING', 2500.00, 'ACTIVE'),
(1, 'ACC-1002', 'SAVINGS', 15000.00, 'ACTIVE'),
(1, 'ACC-1003', 'FIXED', 50000.00, 'ACTIVE'),

-- Customer 2 (Mary Johnson) - 2 accounts
(2, 'ACC-1004', 'CHECKING', 3200.50, 'ACTIVE'),
(2, 'ACC-1005', 'SAVINGS', 22000.00, 'ACTIVE'),

-- Customer 3 (Robert Williams) - 3 accounts
(3, 'ACC-1006', 'CHECKING', 1800.75, 'ACTIVE'),
(3, 'ACC-1007', 'SAVINGS', 8500.00, 'ACTIVE'),
(3, 'ACC-1008', 'FIXED', 100000.00, 'ACTIVE'),

-- Customer 4 (Patricia Brown) - 2 accounts
(4, 'ACC-1009', 'CHECKING', 4500.00, 'ACTIVE'),
(4, 'ACC-1010', 'SAVINGS', 18000.00, 'ACTIVE'),

-- Customer 5 (Michael Jones) - 3 accounts
(5, 'ACC-1011', 'CHECKING', 2200.00, 'ACTIVE'),
(5, 'ACC-1012', 'SAVINGS', 12000.00, 'ACTIVE'),
(5, 'ACC-1013', 'FIXED', 75000.00, 'ACTIVE'),

-- Customer 6 (Linda Garcia) - 2 accounts
(6, 'ACC-1014', 'CHECKING', 3800.25, 'ACTIVE'),
(6, 'ACC-1015', 'SAVINGS', 25000.00, 'ACTIVE'),

-- Customer 7 (William Martinez) - 3 accounts
(7, 'ACC-1016', 'CHECKING', 1500.00, 'ACTIVE'),
(7, 'ACC-1017', 'SAVINGS', 9500.00, 'ACTIVE'),
(7, 'ACC-1018', 'FIXED', 60000.00, 'ACTIVE'),

-- Customer 8 (Elizabeth Rodriguez) - 2 accounts
(8, 'ACC-1019', 'CHECKING', 5200.00, 'ACTIVE'),
(8, 'ACC-1020', 'SAVINGS', 30000.00, 'ACTIVE'),

-- Customer 9 (David Hernandez) - 3 accounts
(9, 'ACC-1021', 'CHECKING', 2800.50, 'ACTIVE'),
(9, 'ACC-1022', 'SAVINGS', 16000.00, 'ACTIVE'),
(9, 'ACC-1023', 'FIXED', 85000.00, 'ACTIVE'),

-- Customer 10 (Jennifer Lopez) - 2 accounts
(10, 'ACC-1024', 'CHECKING', 4100.00, 'ACTIVE'),
(10, 'ACC-1025', 'SAVINGS', 20000.00, 'ACTIVE'),

-- Customer 11 (James Wilson) - 3 accounts
(11, 'ACC-1026', 'CHECKING', 3300.75, 'ACTIVE'),
(11, 'ACC-1027', 'SAVINGS', 14000.00, 'ACTIVE'),
(11, 'ACC-1028', 'FIXED', 70000.00, 'ACTIVE'),

-- Customer 12 (Barbara Moore) - 2 accounts
(12, 'ACC-1029', 'CHECKING', 2900.00, 'ACTIVE'),
(12, 'ACC-1030', 'SAVINGS', 11000.00, 'ACTIVE'),

-- Customer 13 (Richard Taylor) - 2 accounts
(13, 'ACC-1031', 'CHECKING', 3600.00, 'ACTIVE'),
(13, 'ACC-1032', 'SAVINGS', 19000.00, 'ACTIVE'),

-- Customer 14 (Susan Anderson) - 3 accounts
(14, 'ACC-1033', 'CHECKING', 2100.00, 'ACTIVE'),
(14, 'ACC-1034', 'SAVINGS', 13000.00, 'ACTIVE'),
(14, 'ACC-1035', 'FIXED', 55000.00, 'ACTIVE'),

-- Customer 15 (Thomas Thomas) - 2 accounts
(15, 'ACC-1036', 'CHECKING', 4800.00, 'ACTIVE'),
(15, 'ACC-1037', 'SAVINGS', 27000.00, 'ACTIVE'),

-- Customer 16 (Sarah Jackson) - 3 accounts
(16, 'ACC-1038', 'CHECKING', 3100.50, 'ACTIVE'),
(16, 'ACC-1039', 'SAVINGS', 17000.00, 'ACTIVE'),
(16, 'ACC-1040', 'FIXED', 90000.00, 'ACTIVE'),

-- Customer 17 (Charles White) - 2 accounts
(17, 'ACC-1041', 'CHECKING', 2600.00, 'ACTIVE'),
(17, 'ACC-1042', 'SAVINGS', 15500.00, 'ACTIVE'),

-- Customer 18 (Nancy Harris) - 2 accounts
(18, 'ACC-1043', 'CHECKING', 3900.00, 'ACTIVE'),
(18, 'ACC-1044', 'SAVINGS', 21000.00, 'ACTIVE'),

-- Customer 19 (Christopher Martin - INACTIVE customer) - 1 account (should be CLOSED or kept ACTIVE for testing)
(19, 'ACC-1045', 'CHECKING', 0.00, 'CLOSED'),

-- Customer 20 (Lisa Thompson) - 5 accounts (heavy user)
(20, 'ACC-1046', 'CHECKING', 5500.00, 'ACTIVE'),
(20, 'ACC-1047', 'SAVINGS', 35000.00, 'ACTIVE'),
(20, 'ACC-1048', 'FIXED', 120000.00, 'ACTIVE'),
(20, 'ACC-1049', 'CHECKING', 1200.00, 'FROZEN'),
(20, 'ACC-1050', 'SAVINGS', 8000.00, 'ACTIVE');
