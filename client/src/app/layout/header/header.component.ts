import { Component, HostListener, inject, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  themeService = inject(ThemeService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  isScrolled = false;
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  searchQuery = '';
  storageUrl = environment.storageUrl;

  getUserAvatar(user: any): string {
    if (!user || !user.image) return '';
    return user.image.startsWith('http') 
      ? user.image 
      : `${this.storageUrl}/${user.image.replace(/^\//, '')}`;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/shop'], { queryParams: { search: this.searchQuery.trim() } });
      this.searchQuery = '';
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  @HostListener('window:resize', [])
  onResize() {
    if (window.innerWidth > 992) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userMenu = this.elementRef.nativeElement.querySelector('.user-menu-container');
    
    if (this.isDropdownOpen && userMenu && !userMenu.contains(target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.isDropdownOpen = false;
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
