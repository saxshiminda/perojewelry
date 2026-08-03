import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models/cart-item.model';
import { Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  cartItems: CartItem[] = [];
  private sub!: Subscription;

  ngOnInit() {
    this.sub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get isGuest(): boolean {
    return this.cartService.isGuest;
  }

  get subtotal(): number {
    return this.cartService.subtotal;
  }

  get shipping(): number {
    return this.cartService.shipping;
  }

  get total(): number {
    return this.cartService.total;
  }

  removeItem(cartItemId: number) {
    this.cartService.removeItem(cartItemId).subscribe(() => {
      this.toastService.info('Removed from bag');
    });
  }

  updateQuantity(cartItem: CartItem, delta: number) {
    const newQty = cartItem.quantity + delta;
    if (newQty < 1) return;
    this.cartService.updateQuantity(cartItem.id, newQty).subscribe();
  }

  checkout() {
    if (this.isGuest) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' }
      });
      return;
    }
    this.router.navigate(['/checkout']);
  }

  getImageUrl(item: CartItem): string {
    return item.product?.primary_image_url || '';
  }

  getPrice(item: CartItem): number {
    return item.product?.effective_price ?? item.product?.price ?? 0;
  }
}
