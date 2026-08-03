import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  productService = inject(ProductService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  
  product: Product | undefined;
  relatedProducts: Product[] = [];
  quantity: number = 1;
  selectedSize: string = '';
  activeTab: 'description' | 'reviews' = 'description';
  selectedImage: string = '';
  isFullscreen: boolean = false;
  isFavorite: boolean = false;
  private sub: Subscription | null = null;
  private favSub: Subscription | null = null;
  
  reviews: any[] = [];
  reviewsLoading = false;
  
  favoriteService = inject(FavoriteService);

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.productService.getProduct(id).subscribe((p: Product) => {
        this.product = p;
        this.selectedImage = p.primary_image_url || '';
        this.selectedSize = '';
        this.quantity = 1;
        if (p.size_options?.length) {
          const available = p.size_options.find(o => o.stock > 0);
          this.selectedSize = available?.label || p.size_options[0].label;
        }
        this.loadReviews(p.id!);
        this.favSub?.unsubscribe();
        this.favSub = this.favoriteService.favorites$.subscribe(favorites => {
          this.isFavorite = favorites.some(fav => fav.id === this.product?.id);
        });
      });
      this.productService.getProducts().subscribe((res: any) => {
        const prods = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        this.relatedProducts = prods.filter((p: Product) => p.id !== id).slice(0, 4);
      });
    });

    if (this.authService.currentUser) {
      this.favoriteService.getFavorites().subscribe();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.favSub?.unsubscribe();
  }

  changeQuantity(amount: number) {
    if (this.quantity + amount >= 1) {
      this.quantity += amount;
    }
  }

  setTab(tab: 'description' | 'reviews') {
    this.activeTab = tab;
  }

  selectImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  addToCart() {
    if (!this.product) return;

    if (this.product.size_options?.length && !this.selectedSize) {
      this.toastService.error('Please select a size');
      return;
    }

    if (this.product.stock <= 0) {
      this.toastService.error('This piece is out of stock');
      return;
    }

    this.cartService.addToCart(this.product.id!, this.quantity, this.selectedSize, this.product).subscribe({
      next: () => this.toastService.success('Added to bag'),
      error: () => this.toastService.error('Could not add to bag')
    });
  }

  selectSize(label: string) {
    this.selectedSize = label;
  }

  toggleFavorite() {
    if (!this.product) return;
    
    if (!this.authService.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${this.product.id}` }});
      return;
    }
    
    this.isFavorite = !this.isFavorite; // Optimistic
    
    this.favoriteService.toggleFavorite(this.product.id!).subscribe({
      next: () => {
        this.favoriteService.getFavorites().subscribe();
        this.toastService.success(this.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      },
      error: () => {
        this.isFavorite = !this.isFavorite; // Revert
      }
    });
  }

  loadReviews(productId: number) {
    this.reviewsLoading = true;
    this.productService.getReviews(productId).subscribe({
      next: (res) => {
        this.reviews = res.data;
        this.reviewsLoading = false;
      },
      error: () => {
        this.reviewsLoading = false;
      }
    });
  }
}
