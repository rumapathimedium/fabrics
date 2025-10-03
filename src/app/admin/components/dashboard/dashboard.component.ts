import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  totalOrders = 0;
  totalProducts = 0;
  recentOrders: any[] = [];
  lowStockProducts: any[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load dashboard statistics
    this.adminService.getOrdersCount().subscribe((count: number) => {
      this.totalOrders = count;
    });

    this.adminService.getProductsCount().subscribe((count: number) => {
      this.totalProducts = count;
    });

    // Load recent orders
    this.adminService.getRecentOrders().subscribe((orders: any[]) => {
      this.recentOrders = orders;
    });

    // Load low stock products
    this.adminService.getLowStockProducts().subscribe((products: any[]) => {
      this.lowStockProducts = products;
    });
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}