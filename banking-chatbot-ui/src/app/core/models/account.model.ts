export interface Account {
  accountId: number;
  customerId: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'FIXED';
  balance: number;
  status: 'ACTIVE' | 'CLOSED' | 'FROZEN';
  openedDate: string;
  updatedDate: string;
}

export interface AccountRequest {
  customerId: number;
  accountType: 'SAVINGS' | 'CHECKING' | 'FIXED';
  initialDeposit: number;
}

export interface AccountUpdateRequest {
  accountType?: 'SAVINGS' | 'CHECKING' | 'FIXED';
  status?: 'ACTIVE' | 'CLOSED' | 'FROZEN';
}
