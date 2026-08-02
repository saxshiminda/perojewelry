import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService, Category } from '../../../../core/services/category.service';
import { Product } from '../../../../core/models/product.model';
import { PaginatedResponse } from '../../../../core/models/paginated-response.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  products: Product[] = [];
  categories: Category[] = [];
  
  loading = true;

  // Filters
  searchQuery = '';
  categoryId = '';
  currentPage = 1;
  lastPage = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats: any) => {
        this.categories = Array.isArray(cats) ? cats : (cats?.data && Array.isArray(cats.data) ? cats.data : []);
      },
      error: () => this.categories = []
    });
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.productService.getProducts({
      page: this.currentPage,
      per_page: 15, // larger for admin
      search: this.searchQuery,
      category_id: this.categoryId
    }).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        this.lastPage = res?.last_page || 1;
        this.totalItems = res?.total || this.products.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadProducts(1);
  }

  onCategoryChange(): void {
    this.loadProducts(1);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadProducts(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadProducts(this.currentPage - 1);
    }
  }

  deleteProduct(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts(this.currentPage);
        },
        error: (err) => {
          this.toastService.error('Failed to delete product');
          console.error(err);
        }
      });
    }
  }
}
