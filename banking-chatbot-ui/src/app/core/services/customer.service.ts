import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Customer, CustomerRequest } from '../models/customer.model';
import { ApiResponse, PagedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrls.customer}/customers`;

  createCustomer(request: CustomerRequest): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.baseUrl, request);
  }

  getAllCustomers(page: number = 0, limit: number = 10, search?: string): Observable<ApiResponse<PagedResponse<Customer>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<PagedResponse<Customer>>>(this.baseUrl, { params });
  }

  getCustomerById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`);
  }

  updateCustomer(id: number, request: CustomerRequest): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, request);
  }

  deleteCustomer(id: number): Observable<ApiResponse<Customer>> {
    return this.http.delete<ApiResponse<Customer>>(`${this.baseUrl}/${id}`);
  }

  searchCustomers(searchTerm: string): Observable<ApiResponse<PagedResponse<Customer>>> {
    return this.getAllCustomers(0, 20, searchTerm);
  }
}
