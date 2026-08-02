import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);

  activeTab: 'featured' | 'bestseller' | 'new' = 'featured';
  tabProducts: Product[] = [];
  onSaleProducts: Product[] = [];

  ngOnInit() {
    this.loadTabProducts();
    this.loadOnSaleProducts();
  }

  switchTab(tab: 'featured' | 'bestseller' | 'new') {
    this.activeTab = tab;
    this.loadTabProducts();
  }

  loadTabProducts() {
    switch (this.activeTab) {
      case 'featured':
        this.productService.getFeaturedProducts(4).subscribe(products => this.tabProducts = products);
        break;
      case 'bestseller':
        this.productService.getBestSellers(4).subscribe(products => this.tabProducts = products);
        break;
      case 'new':
        this.productService.getNewArrivals(4).subscribe(products => this.tabProducts = products);
        break;
    }
  }

  loadOnSaleProducts() {
    this.productService.getOnSale(4).subscribe(products => this.onSaleProducts = products);
  }
}
