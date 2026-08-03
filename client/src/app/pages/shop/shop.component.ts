import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  products: Product[] = [];
  popularProducts: Product[] = [];
  categories: Category[] = [];

  viewMode: 'grid' | 'list' = 'grid';
  loading = true;

  searchQuery = '';
  categoryId: number | string = '';
  sortBy = 'default';

  absMinPrice = 0;
  absMaxPrice = 200;
  currentMaxPrice = 200;

  currentPage = 1;
  lastPage = 1;
  totalItems = 0;

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats: any) => {
        this.categories = Array.isArray(cats) ? cats : (cats?.data && Array.isArray(cats.data) ? cats.data : []);
      },
      error: () => {
        this.categories = [];
      }
    });

    this.productService.getPriceRange().subscribe(range => {
      this.absMinPrice = range.min;
      this.absMaxPrice = range.max;
      if (!this.route.snapshot.queryParams['max_price']) {
        this.currentMaxPrice = this.absMaxPrice;
      }
    });

    this.productService.getBestSellers(3).subscribe({
      next: (data: any) => {
        this.popularProducts = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
      },
      error: () => {
        this.popularProducts = [];
      }
    });

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.categoryId = params['category_id'] || '';
      this.sortBy = params['sort'] || 'default';
      this.currentPage = params['page'] ? +params['page'] : 1;

      if (params['max_price']) {
        this.currentMaxPrice = +params['max_price'];
      }

      this.loadProducts();
    });
  }

  get activeCategoryName(): string {
    if (!this.categoryId) return '';
    const cat = this.categories.find(c => c.id == this.categoryId);
    return cat?.name || '';
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts({
      page: this.currentPage,
      search: this.searchQuery,
      category_id: this.categoryId,
      sort: this.sortBy,
      max_price: this.currentMaxPrice
    }).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        this.lastPage = res?.last_page || 1;
        this.totalItems = res?.total || this.products.length;
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  onSearchSubmit() {
    this.currentPage = 1;
    if (this.searchQuery) {
      this.searchQuery = this.searchQuery.trim();
    }
    this.updateUrl();
  }

  onCategoryClick(catId: number | undefined, event: Event) {
    event.preventDefault();
    this.categoryId = catId || '';
    this.currentPage = 1;
    this.updateUrl();
  }

  onFilterApply() {
    this.currentPage = 1;
    this.updateUrl();
  }

  onSortChange() {
    this.currentPage = 1;
    this.updateUrl();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.currentPage = page;
      this.updateUrl();
    }
  }

  getPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.lastPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  updateUrl() {
    const queryParams: any = {};
    if (this.searchQuery) queryParams.search = this.searchQuery;
    if (this.categoryId) queryParams.category_id = this.categoryId;
    if (this.sortBy !== 'default') queryParams.sort = this.sortBy;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    if (this.currentMaxPrice < this.absMaxPrice) queryParams.max_price = this.currentMaxPrice;

    this.router.navigate(['/shop'], { queryParams });
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }
}
