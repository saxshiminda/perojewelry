import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
}
