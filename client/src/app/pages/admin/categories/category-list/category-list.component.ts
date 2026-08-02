import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../../core/services/category.service';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  categories: Category[] = [];
  loading = true;
  saving = false;

  newCategoryName = '';
  editingId: number | null = null;
  editCategoryName = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching categories', err);
        this.loading = false;
      }
    });
  }

  addCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.saving = true;
    this.categoryService.createCategory({ name: this.newCategoryName }).subscribe({
      next: (cat) => {
        this.categories.push(cat);
        this.newCategoryName = '';
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  startEdit(cat: Category): void {
    this.editingId = cat.id || null;
    this.editCategoryName = cat.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editCategoryName = '';
  }

  saveEdit(cat: Category): void {
    if (!this.editCategoryName.trim() || !cat.id) return;
    this.saving = true;
    this.categoryService.updateCategory(cat.id, { name: this.editCategoryName }).subscribe({
      next: (updated) => {
        const index = this.categories.findIndex(c => c.id === updated.id);
        if (index > -1) this.categories[index] = updated;
        this.cancelEdit();
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  deleteCategory(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this category? Products linked to it will lose their category.')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== id);
        },
        error: (err) => {
          this.toastService.error('Failed to delete category');
          console.error(err);
        }
      });
    }
  }
}
