import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  readonly statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  orders: Order[] = [];
  loading = true;
  searchQuery = '';
  statusFilter = '';
  currentPage = 1;
  lastPage = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.orderService.getAdminOrders({
      page,
      search: this.searchQuery.trim(),
      status: this.statusFilter
    }).subscribe({
      next: (res) => {
        this.orders = Array.isArray(res?.data) ? res.data : [];
        this.lastPage = res?.last_page || 1;
        this.totalItems = res?.total || this.orders.length;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load orders');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadOrders(1);
  }

  onStatusChange(): void {
    this.loadOrders(1);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadOrders(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  updateStatus(order: Order, status: string): void {
    if (status === order.status) return;
    const previous = order.status;
    order.status = status;

    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: () => this.toastService.success('Shipping status updated'),
      error: () => {
        order.status = previous;
        this.toastService.error('Could not update shipping status');
      }
    });
  }

  formatAddress(order: Order): string {
    const streetLine = [order.shipping_street, order.shipping_building, order.shipping_apartment]
      .filter((part): part is string => !!part && part.trim() !== '')
      .join(', ');
    const line = streetLine || order.shipping_address;
    return [line, order.shipping_city, order.shipping_zip, order.shipping_country]
      .filter((part): part is string => !!part && part.trim() !== '')
      .join(', ');
  }

  pieceSummary(order: Order): string {
    return (order.items || [])
      .map(item => `${item.product?.name || 'Piece'} × ${item.quantity}`)
      .join(', ');
  }
}
