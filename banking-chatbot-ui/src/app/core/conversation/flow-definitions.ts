import { FlowStep, FlowType } from '../models/conversation-state.model';
import * as v from './validators';

/**
 * Complete flow definitions for all 12 conversation flows
 * Each flow is a sequential array of steps that the conversation engine executes
 */

// ============================================================================
// MAIN MENU
// ============================================================================

export const MAIN_MENU_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'Welcome to Banking Services! What would you like to do?',
    options: [
      { label: '👤 Manage Customers', value: 'customers', nextFlow: 'CUSTOMER_VIEW' },
      { label: '💳 Manage Accounts', value: 'accounts', nextFlow: 'ACCOUNT_VIEW' },
      { label: '💰 Manage Transactions', value: 'transactions', nextFlow: 'TRANSACTION_VIEW' }
    ]
  }
];

// ============================================================================
// CUSTOMER FLOWS
// ============================================================================

export const CUSTOMER_VIEW_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'Customer Management - What would you like to do?',
    options: [
      { label: '📋 List all customers', value: 'list', nextStep: 1 },
      { label: '🔍 Search for a customer', value: 'search', nextStep: 3 },
      { label: '➕ Create new customer', value: 'create', nextFlow: 'CUSTOMER_CREATE' },
      { label: '✏️ Update a customer', value: 'update', nextFlow: 'CUSTOMER_UPDATE' },
      { label: '❌ Delete a customer', value: 'delete', nextFlow: 'CUSTOMER_DELETE' },
      { label: '🏠 Main Menu', value: 'menu', nextFlow: 'MAIN_MENU' }
    ]
  },
  { type: 'API_CALL', action: 'listCustomers' }, // Step 1: List all
  { type: 'RESULT' }, // Step 2: Result after list
  { type: 'SEARCH', action: 'searchCustomers', question: 'Enter customer ID, name, or email:' }, // Step 3: Search
  { type: 'SELECT', question: 'Select a customer:' }, // Step 4: Select from results
  { type: 'RESULT' } // Step 5: Result after search
];

export const CUSTOMER_CREATE_FLOW: FlowStep[] = [
  { type: 'PROMPT', field: 'name', question: "What's the customer's full name?", validate: v.required(2, 150) },
  { type: 'PROMPT', field: 'email', question: "What's their email address?", validate: v.email() },
  { type: 'PROMPT', field: 'phone', question: "What's their phone number?", validate: v.phone() },
  { type: 'PROMPT', field: 'address', question: "Mailing address? (or type 'skip')", validate: v.optional(0, 255), optional: true },
  {
    type: 'CONFIRM',
    question: 'Please confirm the details:',
    summaryFields: ['name', 'email', 'phone', 'address']
  },
  { type: 'API_CALL', action: 'createCustomer' },
  { type: 'RESULT', resultMessage: 'Customer created successfully!' }
];

export const CUSTOMER_UPDATE_FLOW: FlowStep[] = [
  { type: 'SEARCH', action: 'searchCustomers', question: 'Search for the customer to update (name, email, or ID):' },
  { type: 'SELECT', question: 'Select a customer to update:' },
  { type: 'PROMPT', field: 'name', question: 'New name (or "skip" to keep current):', validate: v.optional(2, 150), optional: true },
  { type: 'PROMPT', field: 'email', question: 'New email (or "skip" to keep current):', validate: v.optional(0, 150), optional: true },
  { type: 'PROMPT', field: 'phone', question: 'New phone (or "skip" to keep current):', validate: v.optional(7, 30), optional: true },
  { type: 'PROMPT', field: 'address', question: 'New address (or "skip" to keep current):', validate: v.optional(0, 255), optional: true },
  {
    type: 'CONFIRM',
    question: 'Confirm updates:',
    summaryFields: ['name', 'email', 'phone', 'address']
  },
  { type: 'API_CALL', action: 'updateCustomer' },
  { type: 'RESULT', resultMessage: 'Customer updated successfully!' }
];

export const CUSTOMER_DELETE_FLOW: FlowStep[] = [
  { type: 'SEARCH', action: 'searchCustomers', question: 'Search for the customer to deactivate (name, email, or ID):' },
  { type: 'SELECT', question: 'Select a customer to deactivate:' },
  {
    type: 'CONFIRM',
    question: '⚠️ Are you sure you want to deactivate this customer? This will set their status to INACTIVE.',
    summaryFields: ['name', 'email', 'status']
  },
  { type: 'API_CALL', action: 'deleteCustomer' },
  { type: 'RESULT', resultMessage: 'Customer deactivated successfully!' }
];

// ============================================================================
// ACCOUNT FLOWS
// ============================================================================

export const ACCOUNT_VIEW_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'Account Management - What would you like to do?',
    options: [
      { label: '📋 List all accounts', value: 'list', nextStep: 1 },
      { label: '🔍 Search account', value: 'search', nextStep: 3 },
      { label: '➕ Create new account', value: 'create', nextFlow: 'ACCOUNT_CREATE' },
      { label: '✏️ Update an account', value: 'update', nextFlow: 'ACCOUNT_UPDATE' },
      { label: '❌ Close an account', value: 'delete', nextFlow: 'ACCOUNT_DELETE' },
      { label: '🏠 Main Menu', value: 'menu', nextFlow: 'MAIN_MENU' }
    ]
  },
  { type: 'API_CALL', action: 'listAccounts' }, // Step 1: List all
  { type: 'RESULT' }, // Step 2: Result after list
  { type: 'SEARCH', action: 'searchAccounts', question: 'Enter Account Number (e.g. ACC-1001) or Customer ID (number):' }, // Step 3: Search
  { type: 'SELECT', question: 'Select an account:' }, // Step 4: Select from results
  { type: 'RESULT' } // Step 5: Result after search
];

export const ACCOUNT_CREATE_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'How would you like to specify the customer?',
    options: [
      { label: 'I know the customer ID', value: 'id', nextStep: 1 },
      { label: 'Search for the customer', value: 'search', nextStep: 2 }
    ]
  },
  { type: 'PROMPT', field: 'customerId', question: 'Enter customer ID:', validate: v.positiveInteger() },
  { type: 'SEARCH', action: 'searchCustomers', question: 'Search for customer (name, email, or ID):' },
  { type: 'SELECT', question: 'Select a customer:', field: 'customerId' },
  {
    type: 'MENU',
    question: 'What type of account?',
    field: 'accountType',
    options: [
      { label: '💰 Savings', value: 'SAVINGS' },
      { label: '💳 Checking', value: 'CHECKING' },
      { label: '🏦 Fixed Deposit', value: 'FIXED' }
    ]
  },
  { type: 'PROMPT', field: 'initialDeposit', question: 'Initial deposit amount?', validate: v.nonNegative() },
  {
    type: 'CONFIRM',
    question: 'Confirm account details:',
    summaryFields: ['customerId', 'accountType', 'initialDeposit']
  },
  { type: 'API_CALL', action: 'createAccount' },
  { type: 'RESULT', resultMessage: 'Account created successfully!' }
];

export const ACCOUNT_UPDATE_FLOW: FlowStep[] = [
  { type: 'SEARCH', action: 'searchAccounts', question: 'Search account to update (Account Number: ACC-1001 or Customer ID: number):' },
  { type: 'SELECT', question: 'Select an account to update:' },
  {
    type: 'MENU',
    question: 'New account type (or skip):',
    field: 'accountType',
    optional: true,
    options: [
      { label: '💰 Savings', value: 'SAVINGS' },
      { label: '💳 Checking', value: 'CHECKING' },
      { label: '🏦 Fixed Deposit', value: 'FIXED' },
      { label: 'Keep current', value: 'skip' }
    ]
  },
  {
    type: 'MENU',
    question: 'New account status (or skip):',
    field: 'status',
    optional: true,
    options: [
      { label: '✅ Active', value: 'ACTIVE' },
      { label: '🔒 Frozen', value: 'FROZEN' },
      { label: 'Keep current', value: 'skip' }
    ]
  },
  {
    type: 'CONFIRM',
    question: 'Confirm updates:',
    summaryFields: ['accountType', 'status']
  },
  { type: 'API_CALL', action: 'updateAccount' },
  { type: 'RESULT', resultMessage: 'Account updated successfully!' }
];

export const ACCOUNT_DELETE_FLOW: FlowStep[] = [
  { type: 'SEARCH', action: 'searchAccounts', question: 'Search account to close (Account Number: ACC-1001 or Customer ID: number):' },
  { type: 'SELECT', question: 'Select an account to close:' },
  {
    type: 'CONFIRM',
    question: '⚠️ Are you sure you want to close this account? Balance must be zero.',
    summaryFields: ['accountNumber', 'accountType', 'balance', 'status']
  },
  { type: 'API_CALL', action: 'deleteAccount' },
  { type: 'RESULT', resultMessage: 'Account closed successfully!' }
];

// ============================================================================
// TRANSACTION FLOWS
// ============================================================================

export const TRANSACTION_VIEW_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'Transaction Management - What would you like to do?',
    options: [
      { label: '📋 List transactions by account', value: 'list', nextStep: 1 },
      { label: '🔍 View one transaction', value: 'view', nextStep: 3 },
      { label: '➕ Create new transaction', value: 'create', nextFlow: 'TRANSACTION_CREATE' },
      { label: '✏️ Update a transaction', value: 'update', nextFlow: 'TRANSACTION_UPDATE' },
      { label: '❌ Void a transaction', value: 'delete', nextFlow: 'TRANSACTION_DELETE' },
      { label: '🏠 Main Menu', value: 'menu', nextFlow: 'MAIN_MENU' }
    ]
  },
  { type: 'PROMPT', field: 'accountIdentifier', question: 'Enter Account Number (e.g. ACC-1001):', validate: v.required(1, 50) }, // Step 1
  { type: 'API_CALL', action: 'listTransactions' }, // Step 2
  { type: 'PROMPT', field: 'transactionId', question: 'Enter Transaction ID:', validate: v.positiveInteger() }, // Step 3
  { type: 'API_CALL', action: 'getTransactionById' }, // Step 4
  { type: 'RESULT' } // Step 5
];

export const TRANSACTION_CREATE_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'How would you like to specify the source account?',
    options: [
      { label: 'I know the account number', value: 'id', nextStep: 3 },
      { label: 'Search for the account', value: 'search', nextStep: 1 }
    ]
  },
  { type: 'SEARCH', action: 'searchAccounts', question: 'Search account (Account Number: ACC-1001 or Customer ID: number):' }, // Step 1
  { type: 'SELECT', question: 'Select an account:', field: 'accountId' }, // Step 2 → stores accountId
  { type: 'PROMPT', field: 'accountIdentifier', question: 'Enter Account Number (e.g. ACC-1001):', validate: v.required(1, 50) }, // Step 3
  {
    type: 'MENU',
    question: 'Transaction type?',
    field: 'type',
    options: [
      { label: '💸 Debit (withdrawal)', value: 'DEBIT', nextStep: 9 },
      { label: '💵 Credit (deposit)', value: 'CREDIT', nextStep: 9 },
      { label: '🔄 Transfer to another account', value: 'TRANSFER', nextStep: 5 }
    ]
  }, // Step 4
  {
    type: 'MENU',
    question: 'How would you like to specify the destination account?',
    options: [
      { label: 'I know the account number', value: 'id', nextStep: 8 },
      { label: 'Search for the account', value: 'search', nextStep: 6 }
    ]
  }, // Step 5 - only for TRANSFER
  { type: 'SEARCH', action: 'searchAccounts', question: 'Search destination account (Account Number: ACC-1001 or Customer ID: number):' }, // Step 6
  { type: 'SELECT', question: 'Select destination account:', field: 'destinationAccountId' }, // Step 7 → stores destinationAccountId
  { type: 'PROMPT', field: 'destinationAccountIdentifier', question: 'Enter destination Account Number (e.g. ACC-1002):', validate: v.required(1, 50) }, // Step 8
  { type: 'PROMPT', field: 'amount', question: 'Amount?', validate: v.positive() }, // Step 9
  { type: 'PROMPT', field: 'description', question: 'Description? (or "skip")', validate: v.optional(0, 255), optional: true }, // Step 10
  { type: 'PROMPT', field: 'category', question: 'Category? (or "skip")', validate: v.optional(0, 50), optional: true }, // Step 11
  {
    type: 'CONFIRM',
    question: 'Confirm transaction:',
    summaryFields: ['type', 'amount', 'description', 'category']
  }, // Step 12
  { type: 'API_CALL', action: 'createTransaction' }, // Step 13
  { type: 'RESULT', resultMessage: 'Transaction created successfully!' } // Step 14
];

export const TRANSACTION_UPDATE_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'How would you like to find the transaction?',
    options: [
      { label: 'I know the transaction ID', value: 'id', nextStep: 1 },
      { label: 'List by account number', value: 'list', nextStep: 2 }
    ]
  },
  { type: 'PROMPT', field: 'transactionId', question: 'Enter Transaction ID:', validate: v.positiveInteger() }, // Step 1
  { type: 'PROMPT', field: 'accountIdentifier', question: 'Enter Account Number (e.g. ACC-1001):', validate: v.required(1, 50) }, // Step 2
  { type: 'API_CALL', action: 'listTransactions' }, // Step 3
  { type: 'SELECT', question: 'Select a transaction to update:' }, // Step 4
  { type: 'PROMPT', field: 'description', question: 'New description (or "skip" to keep current):', validate: v.optional(0, 255), optional: true }, // Step 5
  { type: 'PROMPT', field: 'category', question: 'New category (or "skip" to keep current):', validate: v.optional(0, 50), optional: true }, // Step 6
  {
    type: 'CONFIRM',
    question: 'Confirm updates (note: amount and type cannot be changed):',
    summaryFields: ['description', 'category']
  },
  { type: 'API_CALL', action: 'updateTransaction' },
  { type: 'RESULT', resultMessage: 'Transaction updated successfully!' }
];

export const TRANSACTION_DELETE_FLOW: FlowStep[] = [
  {
    type: 'MENU',
    question: 'How would you like to find the transaction?',
    options: [
      { label: 'I know the transaction ID', value: 'id', nextStep: 1 },
      { label: 'List by account number', value: 'list', nextStep: 2 }
    ]
  },
  { type: 'PROMPT', field: 'transactionId', question: 'Enter Transaction ID:', validate: v.positiveInteger() }, // Step 1
  { type: 'PROMPT', field: 'accountIdentifier', question: 'Enter Account Number (e.g. ACC-1001):', validate: v.required(1, 50) }, // Step 2
  { type: 'API_CALL', action: 'listTransactions' }, // Step 3
  { type: 'SELECT', question: 'Select a transaction to void:' }, // Step 4
  { type: 'PROMPT', field: 'voidReason', question: 'Why are you voiding this transaction?', validate: v.required(1, 255) }, // Step 5
  {
    type: 'CONFIRM',
    question: '⚠️ Are you sure you want to void this transaction? This will reverse the balance.',
    summaryFields: ['amount', 'txnType', 'description', 'voidReason']
  },
  { type: 'API_CALL', action: 'voidTransaction' },
  { type: 'RESULT', resultMessage: 'Transaction voided successfully!' }
];

// ============================================================================
// FLOW REGISTRY
// ============================================================================

export const FLOW_DEFINITIONS: Record<FlowType, FlowStep[]> = {
  MAIN_MENU: MAIN_MENU_FLOW,
  CUSTOMER_VIEW: CUSTOMER_VIEW_FLOW,
  CUSTOMER_CREATE: CUSTOMER_CREATE_FLOW,
  CUSTOMER_UPDATE: CUSTOMER_UPDATE_FLOW,
  CUSTOMER_DELETE: CUSTOMER_DELETE_FLOW,
  ACCOUNT_VIEW: ACCOUNT_VIEW_FLOW,
  ACCOUNT_CREATE: ACCOUNT_CREATE_FLOW,
  ACCOUNT_UPDATE: ACCOUNT_UPDATE_FLOW,
  ACCOUNT_DELETE: ACCOUNT_DELETE_FLOW,
  TRANSACTION_VIEW: TRANSACTION_VIEW_FLOW,
  TRANSACTION_CREATE: TRANSACTION_CREATE_FLOW,
  TRANSACTION_UPDATE: TRANSACTION_UPDATE_FLOW,
  TRANSACTION_DELETE: TRANSACTION_DELETE_FLOW
};
