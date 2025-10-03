import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  totalItems: number = 0;
  isLoading: boolean = false;
  
  ngOnInit(): void {
    this.loadCart();
    this.subscribeToCartChanges();
  }
  
  private loadCart(): void {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading cart:', error);
      }
    });
  }
  
  private subscribeToCartChanges(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
    
    this.cartService.totalAmount$.subscribe(total => {
      this.totalAmount = total;
    });
    
    this.cartService.totalItems$.subscribe(count => {
      this.totalItems = count;
    });
  }
  
  private calculateTotals(): void {
    this.totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }
    
    this.isLoading = true;
    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.isLoading = false;
      }
    });
  }
  
  onQuantityChange(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      this.updateQuantity(item, newQuantity);
    }
  }
  
  removeItem(item: CartItem): void {
    this.isLoading = true;
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.isLoading = false;
      }
    });
  }
  
  moveToWishlist(item: CartItem): void {
    this.isLoading = true;
    this.cartService.moveToWishlist(item.id).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error moving to wishlist:', error);
        this.isLoading = false;
      }
    });
  }
  
  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.isLoading = true;
      this.cartService.clearCart().subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // Navigate to checkout - implement based on your routing
    console.log('Proceeding to checkout with items:', this.cartItems);
  }
  
  continueShopping(): void {
    // Navigate to products page - implement based on your routing
    console.log('Continue shopping');
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
  
  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }
}