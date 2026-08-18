import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Account, AccountRequest, AccountUpdateRequest } from '../models/account.model';
import { ApiResponse, PagedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrls.account}/accounts`;

  createAccount(request: AccountRequest): Observable<ApiResponse<Account>> {
    return this.http.post<ApiResponse<Account>>(this.baseUrl, request);
  }

  getAllAccounts(page: number = 0, limit: number = 10, customerId?: number): Observable<ApiResponse<PagedResponse<Account>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (customerId) {
      params = params.set('customerId', customerId.toString());
    }

    return this.http.get<ApiResponse<PagedResponse<Account>>>(this.baseUrl, { params });
  }

  getAccountById(id: number): Observable<ApiResponse<Account>> {
    return this.http.get<ApiResponse<Account>>(`${this.baseUrl}/${id}`);
  }

  updateAccount(id: number, request: AccountUpdateRequest): Observable<ApiResponse<Account>> {
    return this.http.put<ApiResponse<Account>>(`${this.baseUrl}/${id}`, request);
  }

  deleteAccount(id: number): Observable<ApiResponse<Account>> {
    return this.http.delete<ApiResponse<Account>>(`${this.baseUrl}/${id}`);
  }

  searchAccounts(customerId?: number): Observable<ApiResponse<PagedResponse<Account>>> {
    return this.getAllAccounts(0, 20, customerId);
  }
}
