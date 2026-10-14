import { Component, ElementRef, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
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
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  private host = inject(ElementRef);

  cartItems: CartItem[] = [];
  private sub!: Subscription;

  shippingName = '';
  shippingEmail = '';
  shippingPhone = '';
  shippingCountry = '';
  shippingCity = '';
  shippingStreet = '';
  shippingBuilding = '';
  shippingApartment = '';
  shippingZip = '';
  paymentMethod = 'credit_card';

  isPlacingOrder = false;
  submitted = false;

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      this.shippingName = user.name || '';
      this.shippingEmail = user.email || '';
    }

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

  errorFor(field: string): string | null {
    if (!this.submitted || field === 'apartment') return null;

    const value = this.valueFor(field).trim();
    if (!value) return 'Required';
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Enter a valid email';
    }
    return null;
  }

  private valueFor(field: string): string {
    switch (field) {
      case 'name': return this.shippingName;
      case 'email': return this.shippingEmail;
      case 'phone': return this.shippingPhone;
      case 'country': return this.shippingCountry;
      case 'city': return this.shippingCity;
      case 'street': return this.shippingStreet;
      case 'building': return this.shippingBuilding;
      case 'zip': return this.shippingZip;
      default: return '';
    }
  }

  private get hasFieldErrors(): boolean {
    return ['name', 'email', 'phone', 'country', 'city', 'street', 'building', 'zip']
      .some(field => this.errorFor(field));
  }

  placeOrder() {
    if (this.isPlacingOrder) return;

    this.submitted = true;
    if (this.hasFieldErrors) {
      this.toastService.error('Please fill in all shipping details');
      setTimeout(() => {
        const invalid = this.host.nativeElement.querySelector('.is-invalid') as HTMLElement | null;
        invalid?.focus();
      });
      return;
    }

    this.isPlacingOrder = true;

    this.orderService.placeOrder({
      shipping_name: this.shippingName.trim(),
      shipping_email: this.shippingEmail.trim(),
      shipping_phone: this.shippingPhone.trim(),
      shipping_country: this.shippingCountry.trim(),
      shipping_city: this.shippingCity.trim(),
      shipping_street: this.shippingStreet.trim(),
      shipping_building: this.shippingBuilding.trim(),
      shipping_apartment: this.shippingApartment.trim() || undefined,
      shipping_zip: this.shippingZip.trim(),
      payment_method: this.paymentMethod,
    }).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.toastService.success('Order placed — #' + order.id);
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to place order. Please try again.');
        this.isPlacingOrder = false;
      }
    });
  }
}
