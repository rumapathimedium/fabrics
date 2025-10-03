import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
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
  }
];
