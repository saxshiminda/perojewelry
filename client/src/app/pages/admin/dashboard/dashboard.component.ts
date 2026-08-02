import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  stats = {
    totalProducts: 0,
    totalOrders: 42, // Dummy
    totalUsers: 156, // Dummy
    revenue: 12540   // Dummy
  };

  ngOnInit(): void {
    this.productService.getProducts().subscribe((res: any) => {
      const products = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      this.stats.totalProducts = res?.total || products.length;
    });
  }
}
