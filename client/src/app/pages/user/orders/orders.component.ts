import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private http = inject(HttpClient);
  
  orders: Order[] = [];
  loading = true;
  
  // Review form state
  selectedProduct: any = null;
  reviewRating = 5;
  reviewComment = '';
  submittingReview = false;

  private toastService = inject(ToastService);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      }
    });
  }

  openReviewForm(product: any) {
    this.selectedProduct = product;
    this.reviewRating = 5;
    this.reviewComment = '';
  }

  closeReviewForm() {
    this.selectedProduct = null;
  }

  submitReview() {
    if (!this.selectedProduct) return;
    
    this.submittingReview = true;
    const url = `${environment.apiUrl}/products/${this.selectedProduct.id}/reviews`;
    const payload = {
      rating: this.reviewRating,
      comment: this.reviewComment
    };

    this.http.post(url, payload).subscribe({
      next: () => {
        this.toastService.success('Review submitted successfully!');
        this.submittingReview = false;
        this.closeReviewForm();
      },
      error: (err) => {
        console.error('Failed to submit review', err);
        const msg = err?.error?.message || 'Failed to submit review. Please try again.';
        this.toastService.error(msg);
        this.submittingReview = false;
      }
    });
  }
}
