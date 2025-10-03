import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  variant: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderFilter {
  status: string;
  dateRange: string;
  searchTerm: string;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = true;
  showOrderDetails = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Filtering
  filter: OrderFilter = {
    status: '',
    dateRange: '',
    searchTerm: ''
  };
  
  statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' }
  ];
  
  dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
    { value: '365', label: 'Last Year' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.checkForOrderDetail();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkForOrderDetail(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.viewOrderDetails(params['id']);
      }
    });
  }

  private loadOrders(): void {
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.orders = this.generateMockOrders();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  private generateMockOrders(): Order[] {
    const orders: Order[] = [];
    const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    
    for (let i = 1; i <= 25; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      
      orders.push({
        id: `order-${i}`,
        orderNumber: `ORD-${1000 + i}`,
        date,
        status,
        total: Math.floor(Math.random() * 500) + 50,
        items: this.generateMockOrderItems(),
        trackingNumber: (status === 'shipped' || status === 'delivered') ? 
          `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
        estimatedDelivery: (status === 'pending' || status === 'processing' || status === 'shipped') ?
          new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined
      });
    }
    
    return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private generateMockOrderItems(): OrderItem[] {
    const products = [
      { name: 'Classic T-Shirt', image: 'https://picsum.photos/80/80?random=1' },
      { name: 'Denim Jeans', image: 'https://picsum.photos/80/80?random=2' },
      { name: 'Sneakers', image: 'https://picsum.photos/80/80?random=3' },
      { name: 'Hooded Sweatshirt', image: 'https://picsum.photos/80/80?random=4' },
      { name: 'Casual Dress', image: 'https://picsum.photos/80/80?random=5' }
    ];

    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items: OrderItem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = Math.floor(Math.random() * 150) + 25;

      items.push({
        id: `item-${i + 1}`,
        productName: product.name,
        productImage: product.image,
        variant: `Size ${['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)]}, Color ${['Black', 'White', 'Blue', 'Red'][Math.floor(Math.random() * 4)]}`,
        quantity,
        price,
        total: price * quantity
      });
    }

    return items;
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Status filter
    if (this.filter.status) {
      filtered = filtered.filter(order => order.status === this.filter.status);
    }

    // Date range filter
    if (this.filter.dateRange) {
      const days = parseInt(this.filter.dateRange);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => order.date >= cutoffDate);
    }

    // Search filter
    if (this.filter.searchTerm) {
      const term = this.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.items.some(item => item.productName.toLowerCase().includes(term)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(term))
      );
    }

    this.filteredOrders = filtered;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getPaginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  clearFilters(): void {
    this.filter = {
      status: '',
      dateRange: '',
      searchTerm: ''
    };
    this.applyFilters();
  }

  viewOrderDetails(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrder = order;
      this.showOrderDetails = true;
    }
  }

  closeOrderDetails(): void {
    this.showOrderDetails = false;
    this.selectedOrder = null;
    this.router.navigate(['/user/order-history']);
  }

  trackOrder(order: Order): void {
    if (order.trackingNumber) {
      // Navigate to tracking page or show tracking modal
      console.log('Tracking order:', order.trackingNumber);
    }
  }

  reorderItems(order: Order): void {
    // Add items to cart and navigate to cart
    console.log('Reordering items from order:', order.orderNumber);
    this.router.navigate(['/cart']);
  }

  cancelOrder(order: Order): void {
    if (order.status === 'pending' || order.status === 'processing') {
      // Show confirmation dialog and cancel order
      if (confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
        console.log('Cancelling order:', order.orderNumber);
        // Update order status locally for demo
        order.status = 'cancelled';
      }
    }
  }

  returnOrder(order: Order): void {
    if (order.status === 'delivered') {
      // Navigate to return request page
      console.log('Initiating return for order:', order.orderNumber);
    }
  }

  downloadInvoice(order: Order): void {
    console.log('Downloading invoice for order:', order.orderNumber);
    // Implement invoice download
  }

  contactSupport(order: Order): void {
    this.router.navigate(['/contact'], { 
      queryParams: { orderNumber: order.orderNumber } 
    });
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled',
      'returned': 'status-returned'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-pending';
  }

  getStatusIcon(status: string): string {
    const statusIcons = {
      'pending': 'fas fa-clock',
      'processing': 'fas fa-cog fa-spin',
      'shipped': 'fas fa-truck',
      'delivered': 'fas fa-check-circle',
      'cancelled': 'fas fa-times-circle',
      'returned': 'fas fa-undo'
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

  get paginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get hasActiveFilters(): boolean {
    return !!(this.filter.status || this.filter.dateRange || this.filter.searchTerm);
  }

  get canCancelOrder(): boolean {
    return this.selectedOrder?.status === 'pending' || this.selectedOrder?.status === 'processing';
  }

  get canReturnOrder(): boolean {
    return this.selectedOrder?.status === 'delivered';
  }

  get canTrackOrder(): boolean {
    return !!(this.selectedOrder?.trackingNumber && 
      (this.selectedOrder?.status === 'shipped' || this.selectedOrder?.status === 'delivered'));
  }
}