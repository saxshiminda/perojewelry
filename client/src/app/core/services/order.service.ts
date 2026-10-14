import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderRequest } from '../models/order.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  placeOrder(orderData: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData, { withCredentials: true });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getAdminOrders(filters: { page?: number; search?: string; status?: string }): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<PaginatedResponse<Order>>(`${environment.apiUrl}/admin/orders`, { params });
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${environment.apiUrl}/admin/orders/${id}`, { status });
  }
}
