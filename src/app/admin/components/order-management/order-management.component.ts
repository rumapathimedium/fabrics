import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, Order, OrderItem } from '../../services/admin.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  orderForm: FormGroup;
  isEditing = false;
  searchTerm = '';
  statusFilter = '';

  orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor() {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      status: ['pending', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminService.getAllOrders().subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
        this.filterOrders();
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toString().includes(this.searchTerm);
      
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.filterOrders();
  }

  onStatusFilterChange(): void {
    this.filterOrders();
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.isEditing = true;
    this.orderForm.patchValue({
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      status: order.status,
      amount: order.amount
    });
  }

  createNewOrder(): void {
    this.selectedOrder = null;
    this.isEditing = true;
    this.orderForm.reset({
      status: 'pending',
      amount: 0
    });
  }

  saveOrder(): void {
    if (this.orderForm.valid) {
      const orderData = this.orderForm.value;
      
      if (this.selectedOrder) {
        // Update existing order
        const updatedOrder = { ...this.selectedOrder, ...orderData };
        this.adminService.updateOrder(updatedOrder.id, updatedOrder).subscribe({
          next: () => {
            this.loadOrders();
            this.cancelEdit();
          },
          error: (error) => {
            console.error('Error updating order:', error);
          }
        });
      } else {
        // Create new order
        this.adminService.createOrder(orderData).subscribe({
          next: () => {
            this.loadOrders();
            this.cancelEdit();
          },
          error: (error) => {
            console.error('Error creating order:', error);
          }
        });
      }
    }
  }

  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.adminService.deleteOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
          if (this.selectedOrder?.id === orderId) {
            this.cancelEdit();
          }
        },
        error: (error) => {
          console.error('Error deleting order:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedOrder = null;
    this.orderForm.reset();
  }

  updateOrderStatus(orderId: number, newStatus: string): void {
    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  onOrderStatusChange(orderId: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updateOrderStatus(orderId, target.value);
    }
  }

  getTotalAmount(): number {
    return this.filteredOrders.reduce((total, order) => total + order.amount, 0);
  }
}