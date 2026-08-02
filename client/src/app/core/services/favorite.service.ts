import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/favorites';

  private favoritesSubject = new BehaviorSubject<Product[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  getFavorites(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(favorites => this.favoritesSubject.next(favorites))
    );
  }

  toggleFavorite(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}`, {}, { withCredentials: true });
  }
}
