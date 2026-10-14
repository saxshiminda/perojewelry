import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../../environments/environment';

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  orders_count: number;
  created_at: string;
}

export interface AdminStats {
  total_products: number;
  total_orders: number;
  total_users: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/stats`;

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(this.apiUrl, { withCredentials: true });
  }

  getCustomers(filters: { page?: number; search?: string }): Observable<PaginatedResponse<AdminCustomer>> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<PaginatedResponse<AdminCustomer>>(`${environment.apiUrl}/admin/customers`, { params });
  }
}
