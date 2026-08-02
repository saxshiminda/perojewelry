import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  getProducts(params?: { category_id?: string | number; search?: string; sort?: string; min_price?: number; max_price?: number; page?: number; per_page?: number }): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params: httpParams });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getPriceRange(): Observable<{ min: number; max: number }> {
    return this.http.get<{ min: number; max: number }>(`${this.apiUrl}/price-range`);
  }

  getFeaturedProducts(limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`, {
      params: { limit: limit.toString() }
    });
  }

  getBestSellers(limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/bestsellers`, {
      params: { limit: limit.toString() }
    });
  }

  getNewArrivals(limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/new-arrivals`, {
      params: { limit: limit.toString() }
    });
  }

  getOnSale(limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/on-sale`, {
      params: { limit: limit.toString() }
    });
  }

  createProduct(product: any): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, { withCredentials: true });
  }

  updateProduct(id: number, product: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, { withCredentials: true });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getReviews(productId: number, page: number = 1): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/${productId}/reviews`, {
      params: { page: page.toString() }
    });
  }
}
