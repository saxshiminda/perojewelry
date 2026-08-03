import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStatsService } from '../../../core/services/admin-stats.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private statsService = inject(AdminStatsService);
  loading = true;
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0
  };

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (res) => {
        this.stats = {
          totalProducts: res.total_products,
          totalOrders: res.total_orders,
          totalUsers: res.total_users,
          revenue: res.revenue
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
