import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutService, OrderSummary, ShippingMethod } from '../../services/checkout.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent implements OnInit {
  orderSummary: OrderSummary | null = null;
  shippingMethods: ShippingMethod[] = [];
  selectedShippingMethod: ShippingMethod | null = null;
  isLoading = false;
  couponCode = '';
  couponMessage = '';
  couponSuccess = false;
  appliedDiscount = 0;

  constructor(private checkoutService: CheckoutService) {}

  ngOnInit(): void {
    this.loadOrderSummary();
    this.loadShippingMethods();
    this.subscribeToCheckoutUpdates();
  }

  private loadOrderSummary(): void {
    this.checkoutService.orderSummary$.subscribe(summary => {
      this.orderSummary = summary;
    });
  }

  private loadShippingMethods(): void {
    this.isLoading = true;
    this.checkoutService.getShippingMethods().subscribe({
      next: (methods) => {
        this.shippingMethods = methods;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading shipping methods:', error);
        this.isLoading = false;
      }
    });
  }

  private subscribeToCheckoutUpdates(): void {
    this.checkoutService.currentShippingMethod$.subscribe(method => {
      this.selectedShippingMethod = method;
    });
  }

  selectShippingMethod(method: ShippingMethod): void {
    this.checkoutService.selectShippingMethod(method);
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponMessage = 'Please enter a coupon code';
      this.couponSuccess = false;
      return;
    }

    this.isLoading = true;
    this.checkoutService.applyCoupon(this.couponCode).subscribe({
      next: (result) => {
        this.couponMessage = result.message;
        this.couponSuccess = result.success;
        if (result.success) {
          this.appliedDiscount = result.discount;
          this.couponCode = '';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.couponMessage = 'Error applying coupon';
        this.couponSuccess = false;
        this.isLoading = false;
      }
    });
  }

  removeCoupon(): void {
    this.appliedDiscount = 0;
    this.couponMessage = '';
    this.couponSuccess = false;
  }

  getDiscountAmount(): number {
    if (!this.orderSummary || this.appliedDiscount === 0) return 0;
    return this.orderSummary.subtotal * this.appliedDiscount;
  }

  getFinalTotal(): number {
    if (!this.orderSummary) return 0;
    return this.orderSummary.total - this.getDiscountAmount();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  getTotalItemCount(): number {
    if (!this.orderSummary?.items) return 0;
    return this.orderSummary.items.reduce((total, item) => total + item.quantity, 0);
  }

  trackByItemId(index: number, item: any): number {
    return item.id;
  }

  trackByMethodId(index: number, method: ShippingMethod): number {
    return method.id;
  }
}