import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Admin Dashboard'
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/order-management/order-management.component').then(m => m.OrderManagementComponent),
        title: 'Order Management'
      },
      {
        path: 'products',
        loadComponent: () => import('./components/product-management/product-management.component').then(m => m.ProductManagementComponent),
        title: 'Product Management'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }