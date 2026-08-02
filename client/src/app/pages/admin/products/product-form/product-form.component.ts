import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService, Category } from '../../../../core/services/category.service';

interface ImageEntry {
  image_url: string;
  is_primary: boolean;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  isEditMode = false;
  productId?: number;
  product: any = {
    name: '',
    description: '',
    material: '',
    finish: '',
    dimensions: '',
    size_options: [],
    price: 0,
    stock: 0,
    category_id: null,
    is_featured: false,
    discount_type: '',
    discount_value: null,
  };
  categories: Category[] = [];
  images: ImageEntry[] = [];
  loading = false;
  uploading = false;
  errorMessage = '';
  isDragging = false;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        if (!this.product.size_options) this.product.size_options = [];
        if (data.images && data.images.length > 0) {
          this.images = data.images.map((img: any) => ({
            image_url: img.image_url,
            is_primary: img.is_primary
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load product data.';
        this.loading = false;
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadFiles(Array.from(input.files));
      input.value = ''; // Reset so same file can be selected again
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      const imageFiles = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        this.uploadFiles(imageFiles);
      }
    }
  }

  private uploadFiles(files: File[]): void {
    this.uploading = true;
    let completed = 0;

    files.forEach(file => {
      const formData = new FormData();
      formData.append('image', file);

      this.http.post<{ image_url: string }>('/api/upload/image', formData, { withCredentials: true }).subscribe({
        next: (res) => {
          const isFirst = this.images.length === 0;
          this.images.push({ image_url: res.image_url, is_primary: isFirst });
          completed++;
          if (completed === files.length) this.uploading = false;
        },
        error: () => {
          this.errorMessage = `Failed to upload ${file.name}. Max 5MB, JPEG/PNG/GIF/WebP only.`;
          completed++;
          if (completed === files.length) this.uploading = false;
        }
      });
    });
  }

  removeImage(index: number): void {
    const wasPrimary = this.images[index].is_primary;
    this.images.splice(index, 1);
    if (wasPrimary && this.images.length > 0) {
      this.images[0].is_primary = true;
    }
  }

  setPrimary(index: number): void {
    this.images.forEach((img, i) => img.is_primary = (i === index));
  }

  addSizeOption(): void {
    if (!this.product.size_options) {
      this.product.size_options = [];
    }
    this.product.size_options.push({ label: '', stock: 0 });
  }

  removeSizeOption(index: number): void {
    this.product.size_options.splice(index, 1);
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    if (this.images.length === 0) {
      this.errorMessage = 'Please upload at least one image.';
      this.loading = false;
      return;
    }

    const payload = {
      name: this.product.name,
      description: this.product.description,
      material: this.product.material || null,
      finish: this.product.finish || null,
      dimensions: this.product.dimensions || null,
      size_options: (this.product.size_options || []).filter((o: any) => o.label),
      price: this.product.price,
      stock: this.product.stock,
      category_id: this.product.category_id,
      is_featured: this.product.is_featured,
      discount_type: this.product.discount_type || null,
      discount_value: this.product.discount_value || null,
      images: this.images,
    };

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, payload).subscribe({
        next: () => this.router.navigate(['/admin/products']),
        error: () => {
          this.errorMessage = 'Failed to update product.';
          this.loading = false;
        }
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => this.router.navigate(['/admin/products']),
        error: () => {
          this.errorMessage = 'Failed to create product.';
          this.loading = false;
        }
      });
    }
  }
}
