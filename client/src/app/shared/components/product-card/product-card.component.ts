import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private favoriteService = inject(FavoriteService);
  private toastService = inject(ToastService);

  isFavorite = false;
  private sub: Subscription | null = null;

  ngOnInit() {
    this.sub = this.favoriteService.favorites$.subscribe(favorites => {
      this.isFavorite = favorites.some(p => p.id === this.product.id);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${this.product.id}` }});
      return;
    }
    
    // Optimistic toggle
    this.isFavorite = !this.isFavorite;
    
    this.favoriteService.toggleFavorite(this.product.id!).subscribe({
      next: () => {
        this.favoriteService.getFavorites().subscribe();
        this.toastService.success(this.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      },
      error: () => {
        this.isFavorite = !this.isFavorite; // Revert on failure
      }
    });
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.product.size_options?.length) {
      this.router.navigate(['/product', this.product.id]);
      return;
    }

    if (this.product.stock <= 0) {
      this.toastService.error('Out of stock');
      return;
    }

    this.cartService.addToCart(this.product.id!, 1, '', this.product).subscribe({
      next: () => this.toastService.success('Added to bag'),
      error: () => this.toastService.error('Could not add to bag')
    });
  }

  goToProduct(): void {
    this.router.navigate(['/product', this.product.id]);
  }
}
