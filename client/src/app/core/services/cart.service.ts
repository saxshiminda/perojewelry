import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/cart`;

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    // Load cart when user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCart();
      } else {
        this.cartItemsSubject.next([]);
        this.cartCountSubject.next(0);
      }
    });
  }

  loadCart(): void {
    this.http.get<CartItem[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    ).subscribe(items => {
      this.cartItemsSubject.next(items);
      this.updateCount(items);
    });
  }

  addToCart(productId: number, quantity: number = 1, selectedSize: string = ''): Observable<CartItem> {
    return this.http.post<CartItem>(this.apiUrl, {
      product_id: productId,
      quantity,
      selected_size: selectedSize || ''
    }, { withCredentials: true }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/${cartItemId}`, { quantity }, { withCredentials: true }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartItemId}`, { withCredentials: true }).pipe(
      tap(() => this.loadCart())
    );
  }

  get cartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => {
      const price = item.product.effective_price ?? item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  }

  get shipping(): number {
    return this.subtotal > 200 ? 0 : 15;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.cartCountSubject.next(0);
  }

  private updateCount(items: CartItem[]): void {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);
  }
}
