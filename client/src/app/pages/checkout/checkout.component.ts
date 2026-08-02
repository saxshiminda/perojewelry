import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItem } from '../../core/models/cart-item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);
  toastService = inject(ToastService);

  cartItems: CartItem[] = [];
  private sub!: Subscription;

  // Form fields
  shippingName = '';
  shippingEmail = '';
  shippingAddress = '';
  shippingCity = '';
  shippingZip = '';
  paymentMethod = 'credit_card';

  isPlacingOrder = false;

  ngOnInit() {
    this.sub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
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

  getPrice(item: CartItem): number {
    return item.product?.effective_price ?? item.product?.price ?? 0;
  }

  placeOrder() {
    if (this.isPlacingOrder) return;
    this.isPlacingOrder = true;

    this.orderService.placeOrder({
      shipping_name: this.shippingName,
      shipping_email: this.shippingEmail,
      shipping_address: this.shippingAddress,
      shipping_city: this.shippingCity,
      shipping_zip: this.shippingZip,
      payment_method: this.paymentMethod,
    }).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.toastService.success('Order placed successfully! Order #' + order.id);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to place order. Please try again.');
        this.isPlacingOrder = false;
      }
    });
  }
}
