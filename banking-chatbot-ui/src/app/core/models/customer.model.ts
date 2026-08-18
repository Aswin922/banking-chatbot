export interface Customer {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdDate: string;
  updatedDate: string;
}

export interface CustomerRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
}
