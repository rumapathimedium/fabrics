import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, WishlistItem } from '../../services';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  isLoading: boolean = false;
  
  constructor(private cartService: CartService) {}
  
  ngOnInit(): void {
    this.loadWishlist();
    this.subscribeToWishlistChanges();
  }
  
  private loadWishlist(): void {
    this.cartService.getWishlistItems().subscribe({
      next: (items: WishlistItem[]) => {
        this.wishlistItems = items;
      },
      error: (error: any) => {
        console.error('Error loading wishlist:', error);
      }
    });
  }
  
  private subscribeToWishlistChanges(): void {
    this.cartService.wishlistItems$.subscribe((items: WishlistItem[]) => {
      this.wishlistItems = items;
    });
  }
  
  addToCart(item: WishlistItem): void {
    this.isLoading = true;
    this.cartService.addToCartFromWishlist(item.id).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error adding to cart:', error);
        this.isLoading = false;
      }
    });
  }
  
  removeFromWishlist(item: WishlistItem): void {
    this.isLoading = true;
    this.cartService.removeFromWishlist(item.id).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error removing from wishlist:', error);
        this.isLoading = false;
      }
    });
  }
  
  clearWishlist(): void {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      this.isLoading = true;
      this.cartService.clearWishlist().subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error clearing wishlist:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  addAllToCart(): void {
    if (this.wishlistItems.length === 0) {
      alert('Your wishlist is empty!');
      return;
    }
    
    this.isLoading = true;
    this.cartService.addAllWishlistToCart().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error adding all to cart:', error);
        this.isLoading = false;
      }
    });
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
  
  trackByItemId(index: number, item: WishlistItem): number {
    return item.id;
  }
}