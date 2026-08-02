import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ShopComponent } from './pages/shop/shop.component';
import { ProductComponent } from './pages/product/product.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent as AdminDashboard } from './pages/admin/dashboard/dashboard.component';
import { ProductListComponent } from './pages/admin/products/product-list/product-list.component';
import { ProductFormComponent } from './pages/admin/products/product-form/product-form.component';
import { CategoryListComponent } from './pages/admin/categories/category-list/category-list.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { FavoritesComponent } from './pages/user/favorites/favorites.component';
import { OrdersComponent } from './pages/user/orders/orders.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'shop', component: ShopComponent },
    { path: 'product/:id', component: ProductComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
    { path: 'cart', component: CartComponent },
    { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
    
    // User Routes
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard] },
    { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
    
    // Admin Routes
    { 
        path: 'admin', 
        canActivate: [authGuard, adminGuard],
        children: [
            { path: 'dashboard', component: AdminDashboard },
            { path: 'products', component: ProductListComponent },
            { path: 'products/new', component: ProductFormComponent },
            { path: 'products/edit/:id', component: ProductFormComponent },
            { path: 'categories', component: CategoryListComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
