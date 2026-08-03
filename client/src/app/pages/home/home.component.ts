import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService, Category } from '../../core/services/category.service';
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
  categoryService = inject(CategoryService);

  activeTab: 'featured' | 'bestseller' | 'new' = 'featured';
  tabProducts: Product[] = [];
  onSaleProducts: Product[] = [];
  categories: Category[] = [];

  private collectionImages: Record<string, string> = {
    necklaces: '/images/products/garnet-chainmail-necklace.png',
    headpieces: '/images/products/crystal-web-headpiece.png',
    chains: '/images/products/barbed-wallet-chain.png',
    accessories: '/images/products/chainmail-lighter-case.png',
  };

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats: any) => {
        this.categories = Array.isArray(cats) ? cats : (cats?.data && Array.isArray(cats.data) ? cats.data : []);
      },
      error: () => {
        this.categories = [];
      }
    });
    this.loadTabProducts();
    this.loadOnSaleProducts();
  }

  collectionImage(cat: Category): string {
    const key = (cat.slug || cat.name || '').toLowerCase();
    return this.collectionImages[key] || '/images/products/rose-quartz-spike-necklace.png';
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
