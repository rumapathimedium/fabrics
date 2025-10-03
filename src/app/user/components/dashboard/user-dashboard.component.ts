import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, User as AuthUser } from '../../../auth/services/auth.service';

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  wishlistItems: number;
  rewardPoints: number;
  nextDelivery?: Date;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: any[];
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  trackingNumber?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: AuthUser | null = null;
  dashboardStats: DashboardStats | null = null;
  recentOrders: Order[] = [];
  isLoading = true;
  isStatsLoading = true;

  quickActions: QuickAction[] = [
    {
      title: 'View Orders',
      description: 'Track your order history',
      icon: 'fas fa-box',
      route: '/user/order-history',
      color: '#3182ce'
    },
    {
      title: 'Update Profile',
      description: 'Manage your information',
      icon: 'fas fa-user-edit',
      route: '/user/profile',
      color: '#48bb78'
    },
    {
      title: 'Account Settings',
      description: 'Security & preferences',
      icon: 'fas fa-cog',
      route: '/user/settings',
      color: '#ed8936'
    },
    {
      title: 'Wishlist',
      description: 'Your saved items',
      icon: 'fas fa-heart',
      route: '/cart/wishlist',
      color: '#f56565'
    },
    {
      title: 'Browse Products',
      description: 'Discover new items',
      icon: 'fas fa-shopping-bag',
      route: '/products',
      color: '#9f7aea'
    },
    {
      title: 'Contact Support',
      description: 'Get help when needed',
      icon: 'fas fa-headset',
      route: '/contact',
      color: '#38b2ac'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardStats();
    this.loadRecentOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
      }
    });
  }

  private loadDashboardStats(): void {
    // Mock data for now until UserService is properly integrated
    setTimeout(() => {
      this.dashboardStats = {
        totalOrders: 12,
        totalSpent: 1234.56,
        pendingOrders: 2,
        wishlistItems: 8,
        rewardPoints: 450,
        nextDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };
      this.isStatsLoading = false;
    }, 300);
  }

  private loadRecentOrders(): void {
    // Mock data for now
    setTimeout(() => {
      this.recentOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-1001',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'shipped',
          total: 89.99,
          items: [],
          shippingAddress: {} as any,
          billingAddress: {} as any,
          paymentMethod: 'Credit Card',
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-1002',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'delivered',
          total: 156.50,
          items: [],
          shippingAddress: {} as any,
          billingAddress: {} as any,
          paymentMethod: 'Credit Card'
        }
      ];
    }, 400);
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-pending';
  }

  getStatusIcon(status: string): string {
    const statusIcons = {
      'pending': 'fas fa-clock',
      'processing': 'fas fa-cog fa-spin',
      'shipped': 'fas fa-truck',
      'delivered': 'fas fa-check-circle',
      'cancelled': 'fas fa-times-circle'
    };
    return statusIcons[status as keyof typeof statusIcons] || 'fas fa-clock';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getMembershipDuration(): string {
    // For now, return a static value since AuthUser doesn't have memberSince
    return 'Member since 2023';
  }

  onQuickAction(action: QuickAction): void {
    this.router.navigate([action.route]);
  }

  onViewAllOrders(): void {
    this.router.navigate(['/user/order-history']);
  }

  onTrackOrder(order: Order): void {
    if (order.trackingNumber) {
      this.router.navigate(['/user/order-history', order.id]);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/auth/login']);
      }
    });
  }
}