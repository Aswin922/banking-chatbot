export interface Transaction {
  transactionId: number;
  accountId: number;
  txnDate: string;
  amount: number;
  txnType: 'DEBIT' | 'CREDIT';
  description?: string;
  category?: string;
  status: 'POSTED' | 'VOIDED';
  createdAt: string;
}

export interface TransactionRequest {
  accountId: number;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  category?: string;
}

export interface TransactionUpdateRequest {
  description?: string;
  category?: string;
}

export interface VoidRequest {
  voidReason: string;
}
