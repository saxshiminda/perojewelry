import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, switchMap, map } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { AuthService, User } from './auth.service';

interface GuestCartEntry {
  id: number;
  product_id: number;
  quantity: number;
  selected_size: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/cart`;
  private readonly guestKey = 'perojewelry_guest_cart';

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  private previousUser: User | null = null;
  private guestIdSeq = -1;

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const justLoggedIn = !this.previousUser;
        if (justLoggedIn && this.readGuestCart().length > 0) {
          this.mergeGuestCart().subscribe({
            next: () => this.loadCart(),
            error: () => this.loadCart()
          });
        } else {
          this.loadCart();
        }
      } else {
        this.loadGuestCart();
      }
      this.previousUser = user;
    });
  }

  get isGuest(): boolean {
    return !this.authService.currentUser;
  }

  loadCart(): void {
    this.http.get<CartItem[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    ).subscribe(items => {
      this.cartItemsSubject.next(items);
      this.updateCount(items);
    });
  }

  addToCart(productId: number, quantity: number = 1, selectedSize: string = '', product?: Product): Observable<CartItem> {
    if (this.isGuest) {
      if (!product) {
        throw new Error('Product snapshot required for guest cart');
      }
      const item = this.addGuestItem(productId, quantity, selectedSize, product);
      return of(item);
    }

    return this.http.post<CartItem>(this.apiUrl, {
      product_id: productId,
      quantity,
      selected_size: selectedSize || ''
    }, { withCredentials: true }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<CartItem | null> {
    if (this.isGuest) {
      const items = this.readGuestCart();
      const entry = items.find(i => i.id === cartItemId);
      if (!entry) return of(null);
      entry.quantity = quantity;
      this.writeGuestCart(items);
      this.loadGuestCart();
      return of(this.toCartItem(entry));
    }

    return this.http.put<CartItem>(`${this.apiUrl}/${cartItemId}`, { quantity }, { withCredentials: true }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeItem(cartItemId: number): Observable<unknown> {
    if (this.isGuest) {
      const items = this.readGuestCart().filter(i => i.id !== cartItemId);
      this.writeGuestCart(items);
      this.loadGuestCart();
      return of(null);
    }

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
    this.writeGuestCart([]);
    this.cartItemsSubject.next([]);
    this.cartCountSubject.next(0);
  }

  private mergeGuestCart(): Observable<CartItem[]> {
    const guestItems = this.readGuestCart();
    if (!guestItems.length) {
      return of([]);
    }

    return this.http.post<CartItem[]>(`${this.apiUrl}/merge`, {
      items: guestItems.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        selected_size: i.selected_size || ''
      }))
    }, { withCredentials: true }).pipe(
      tap(() => this.writeGuestCart([])),
      catchError(() => {
        // Fall back to sequential adds if merge fails
        return guestItems.reduce(
          (chain, item) => chain.pipe(
            switchMap(() => this.http.post(`${this.apiUrl}`, {
              product_id: item.product_id,
              quantity: item.quantity,
              selected_size: item.selected_size || ''
            }, { withCredentials: true }).pipe(catchError(() => of(null))))
          ),
          of(null) as Observable<unknown>
        ).pipe(
          tap(() => this.writeGuestCart([])),
          map(() => [] as CartItem[])
        );
      })
    );
  }

  private loadGuestCart(): void {
    const items = this.readGuestCart().map(e => this.toCartItem(e));
    this.cartItemsSubject.next(items);
    this.updateCount(items);
  }

  private addGuestItem(productId: number, quantity: number, selectedSize: string, product: Product): CartItem {
    const items = this.readGuestCart();
    const size = selectedSize || '';
    const existing = items.find(i => i.product_id === productId && i.selected_size === size);

    if (existing) {
      existing.quantity += quantity;
      existing.product = product;
    } else {
      items.push({
        id: this.guestIdSeq--,
        product_id: productId,
        quantity,
        selected_size: size,
        product
      });
    }

    this.writeGuestCart(items);
    this.loadGuestCart();
    const saved = items.find(i => i.product_id === productId && i.selected_size === size)!;
    return this.toCartItem(saved);
  }

  private readGuestCart(): GuestCartEntry[] {
    try {
      const raw = localStorage.getItem(this.guestKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeGuestCart(items: GuestCartEntry[]): void {
    localStorage.setItem(this.guestKey, JSON.stringify(items));
    const minId = items.reduce((min, i) => Math.min(min, i.id), -1);
    if (minId <= this.guestIdSeq) {
      this.guestIdSeq = minId - 1;
    }
  }

  private toCartItem(entry: GuestCartEntry): CartItem {
    return {
      id: entry.id,
      user_id: 0,
      product_id: entry.product_id,
      quantity: entry.quantity,
      selected_size: entry.selected_size,
      product: entry.product
    };
  }

  private updateCount(items: CartItem[]): void {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);
  }
}
