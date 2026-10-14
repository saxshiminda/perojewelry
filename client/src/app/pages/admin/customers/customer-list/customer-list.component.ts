import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCustomer, AdminStatsService } from '../../../../core/services/admin-stats.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  private statsService = inject(AdminStatsService);
  private toastService = inject(ToastService);

  customers: AdminCustomer[] = [];
  loading = true;
  searchQuery = '';
  currentPage = 1;
  lastPage = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.statsService.getCustomers({
      page,
      search: this.searchQuery.trim()
    }).subscribe({
      next: (res) => {
        this.customers = Array.isArray(res?.data) ? res.data : [];
        this.lastPage = res?.last_page || 1;
        this.totalItems = res?.total || this.customers.length;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load customers');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadCustomers(1);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadCustomers(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadCustomers(this.currentPage - 1);
    }
  }
}
