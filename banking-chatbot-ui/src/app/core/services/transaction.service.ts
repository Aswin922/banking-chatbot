import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaction, TransactionRequest, TransactionUpdateRequest, VoidRequest } from '../models/transaction.model';
import { ApiResponse, PagedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrls.transaction}/transactions`;

  createTransaction(request: TransactionRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.baseUrl, request);
  }

  getAllTransactions(
    accountId: number,
    page: number = 0,
    limit: number = 10,
    fromDate?: string,
    toDate?: string
  ): Observable<ApiResponse<PagedResponse<Transaction>>> {
    let params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get<ApiResponse<PagedResponse<Transaction>>>(this.baseUrl, { params });
  }

  getTransactionById(id: number): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`);
  }

  updateTransaction(id: number, request: TransactionUpdateRequest): Observable<ApiResponse<Transaction>> {
    return this.http.put<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`, request);
  }

  voidTransaction(id: number, request: VoidRequest): Observable<ApiResponse<Transaction>> {
    return this.http.delete<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`, {
      body: request
    });
  }

  searchTransactions(accountId: number): Observable<ApiResponse<PagedResponse<Transaction>>> {
    return this.getAllTransactions(accountId, 0, 20);
  }
}
