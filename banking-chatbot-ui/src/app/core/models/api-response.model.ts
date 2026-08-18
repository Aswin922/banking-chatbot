/**
 * Standard API response envelope from all backend services
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PagedResponse<T> {
  customers?: T[];
  accounts?: T[];
  transactions?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
