import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  private categoryService = inject(CategoryService);
  categories: Category[] = [];

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats: any) => {
        this.categories = Array.isArray(cats) ? cats : (cats?.data && Array.isArray(cats.data) ? cats.data : []);
      },
      error: () => {
        this.categories = [];
      }
    });
  }
}
