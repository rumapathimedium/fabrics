import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/components/home/home.component').then(m => m.HomeComponent),
    title: 'Cloth - Premium Fashion Store'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/components/home/home.component').then(m => m.HomeComponent),
    title: 'Cloth - Premium Fashion Store'
  },
  {
    path: 'products',
    loadComponent: () => import('./products/components/product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'Products - Cloth'
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./products/components/product-details/product-details.component').then(m => m.ProductDetailsComponent),
    title: 'Product Details - Cloth'
  },
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/components/login/login.component').then(m => m.LoginComponent),
        title: 'Login - Cloth'
      },
      {
        path: 'registration',
        loadComponent: () => import('./auth/components/registration/registration.component').then(m => m.RegistrationComponent),
        title: 'Register - Cloth'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./auth/components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password - Cloth'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./auth/components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Reset Password - Cloth'
      }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'user',
    loadComponent: () => import('./user/components/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
    title: 'User Dashboard - Cloth'
  },
  {
    path: 'cart',
    children: [
      {
        path: '',
        redirectTo: 'cart',
        pathMatch: 'full'
      },
      {
        path: 'cart',
        loadComponent: () => import('./cart/components/cart/cart.component').then(m => m.CartComponent),
        title: 'Shopping Cart - Cloth'
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./cart/components/wishlist/wishlist.component').then(m => m.WishlistComponent),
        title: 'Wishlist - Cloth'
      }
    ]
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/components/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us - Cloth'
  },
  {
    path: '**',
    loadComponent: () => import('./core/protected/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - Cloth'
  }
];
