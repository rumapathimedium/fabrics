import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

// Interfaces
export interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
  sku: string;
  inStock: boolean;
  category: string;
}

export interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  size?: string;
  color?: string;
  image: string;
  sku: string;
  inStock: boolean;
  category: string;
  dateAdded: Date;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private wishlistItemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  private totalAmountSubject = new BehaviorSubject<number>(0);
  private totalItemsSubject = new BehaviorSubject<number>(0);

  // Mock data for development
  private mockProducts: any[] = [
    {
      id: 1,
      name: 'Premium Cotton T-Shirt',
      brand: 'ClothBrand',
      price: 29.99,
      originalPrice: 39.99,
      image: 'assets/images/tshirt1.jpg',
      sku: 'CT001',
      inStock: true,
      category: 'T-Shirts'
    },
    {
      id: 2,
      name: 'Denim Jeans',
      brand: 'DenimCo',
      price: 79.99,
      originalPrice: 99.99,
      image: 'assets/images/jeans1.jpg',
      sku: 'DJ001',
      inStock: true,
      category: 'Jeans'
    },
    {
      id: 3,
      name: 'Summer Dress',
      brand: 'FashionHub',
      price: 89.99,
      image: 'assets/images/dress1.jpg',
      sku: 'SD001',
      inStock: false,
      category: 'Dresses'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeCart();
  }

  private initializeCart(): void {
    const cartData = this.getFromStorage('cart_items');
    const wishlistData = this.getFromStorage('wishlist_items');
    
    if (cartData) {
      try {
        const cartItems = JSON.parse(cartData);
        this.cartItemsSubject.next(cartItems);
        this.calculateTotals();
      } catch (error) {
        console.error('Error parsing cart data:', error);
        this.clearCartData();
      }
    }
    
    if (wishlistData) {
      try {
        const wishlistItems = JSON.parse(wishlistData);
        this.wishlistItemsSubject.next(wishlistItems);
      } catch (error) {
        console.error('Error parsing wishlist data:', error);
        this.clearWishlistData();
      }
    }
  }

  // Helper methods for localStorage access (SSR safe)
  private getFromStorage(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setToStorage(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private removeFromStorage(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  private clearCartData(): void {
    this.removeFromStorage('cart_items');
    this.cartItemsSubject.next([]);
    this.calculateTotals();
  }

  private clearWishlistData(): void {
    this.removeFromStorage('wishlist_items');
    this.wishlistItemsSubject.next([]);
  }

  private saveCartToStorage(): void {
    const cartItems = this.cartItemsSubject.value;
    this.setToStorage('cart_items', JSON.stringify(cartItems));
  }

  private saveWishlistToStorage(): void {
    const wishlistItems = this.wishlistItemsSubject.value;
    this.setToStorage('wishlist_items', JSON.stringify(wishlistItems));
  }

  private calculateTotals(): void {
    const cartItems = this.cartItemsSubject.value;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    this.totalItemsSubject.next(totalItems);
    this.totalAmountSubject.next(totalAmount);
  }

  // Public observables
  get cartItems$(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  get wishlistItems$(): Observable<WishlistItem[]> {
    return this.wishlistItemsSubject.asObservable();
  }

  get totalAmount$(): Observable<number> {
    return this.totalAmountSubject.asObservable();
  }

  get totalItems$(): Observable<number> {
    return this.totalItemsSubject.asObservable();
  }

  // Getters for current state
  get cartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get wishlistItems(): WishlistItem[] {
    return this.wishlistItemsSubject.value;
  }

  get totalAmount(): number {
    return this.totalAmountSubject.value;
  }

  get totalItems(): number {
    return this.totalItemsSubject.value;
  }

  // Cart methods
  getCartItems(): Observable<CartItem[]> {
    return of(this.cartItems).pipe(delay(100));
  }

  addToCart(productId: number, quantity: number = 1, size?: string, color?: string): Observable<CartItem> {
    return new Observable<CartItem>(observer => {
      setTimeout(() => {
        const product = this.mockProducts.find(p => p.id === productId);
        if (!product) {
          observer.error({ message: 'Product not found' });
          return;
        }

        const cartItems = [...this.cartItems];
        const existingItemIndex = cartItems.findIndex(item => 
          item.id === productId && item.size === size && item.color === color
        );

        if (existingItemIndex > -1) {
          cartItems[existingItemIndex].quantity += quantity;
        } else {
          const newItem: CartItem = {
            ...product,
            quantity,
            size,
            color
          };
          cartItems.push(newItem);
        }

        this.cartItemsSubject.next(cartItems);
        this.calculateTotals();
        this.saveCartToStorage();

        const addedItem = cartItems.find(item => 
          item.id === productId && item.size === size && item.color === color
        )!;
        
        observer.next(addedItem);
        observer.complete();
      }, 500);
    });
  }

  updateQuantity(itemId: number, newQuantity: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const cartItems = [...this.cartItems];
        const itemIndex = cartItems.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
          if (newQuantity <= 0) {
            cartItems.splice(itemIndex, 1);
          } else {
            cartItems[itemIndex].quantity = newQuantity;
          }

          this.cartItemsSubject.next(cartItems);
          this.calculateTotals();
          this.saveCartToStorage();
        }

        observer.next();
        observer.complete();
      }, 300);
    });
  }

  removeFromCart(itemId: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.cartItemsSubject.next(cartItems);
        this.calculateTotals();
        this.saveCartToStorage();

        observer.next();
        observer.complete();
      }, 300);
    });
  }

  clearCart(): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        this.clearCartData();
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  // Wishlist methods
  getWishlistItems(): Observable<WishlistItem[]> {
    return of(this.wishlistItems).pipe(delay(100));
  }

  addToWishlist(productId: number, size?: string, color?: string): Observable<WishlistItem> {
    return new Observable<WishlistItem>(observer => {
      setTimeout(() => {
        const product = this.mockProducts.find(p => p.id === productId);
        if (!product) {
          observer.error({ message: 'Product not found' });
          return;
        }

        const wishlistItems = [...this.wishlistItems];
        const existingItemIndex = wishlistItems.findIndex(item => 
          item.id === productId && item.size === size && item.color === color
        );

        if (existingItemIndex > -1) {
          observer.error({ message: 'Item already in wishlist' });
          return;
        }

        const newItem: WishlistItem = {
          ...product,
          size,
          color,
          dateAdded: new Date()
        };
        wishlistItems.push(newItem);

        this.wishlistItemsSubject.next(wishlistItems);
        this.saveWishlistToStorage();
        
        observer.next(newItem);
        observer.complete();
      }, 500);
    });
  }

  removeFromWishlist(itemId: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const wishlistItems = this.wishlistItems.filter(item => item.id !== itemId);
        this.wishlistItemsSubject.next(wishlistItems);
        this.saveWishlistToStorage();

        observer.next();
        observer.complete();
      }, 300);
    });
  }

  clearWishlist(): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        this.clearWishlistData();
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  // Move between cart and wishlist
  moveToWishlist(itemId: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const cartItems = [...this.cartItems];
        const itemIndex = cartItems.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
          const item = cartItems[itemIndex];
          const wishlistItem: WishlistItem = {
            id: item.id,
            name: item.name,
            brand: item.brand,
            price: item.price,
            originalPrice: item.originalPrice,
            size: item.size,
            color: item.color,
            image: item.image,
            sku: item.sku,
            inStock: item.inStock,
            category: item.category,
            dateAdded: new Date()
          };

          // Remove from cart
          cartItems.splice(itemIndex, 1);
          this.cartItemsSubject.next(cartItems);
          this.calculateTotals();
          this.saveCartToStorage();

          // Add to wishlist
          const wishlistItems = [...this.wishlistItems, wishlistItem];
          this.wishlistItemsSubject.next(wishlistItems);
          this.saveWishlistToStorage();
        }

        observer.next();
        observer.complete();
      }, 500);
    });
  }

  addToCartFromWishlist(itemId: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const wishlistItems = [...this.wishlistItems];
        const itemIndex = wishlistItems.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
          const item = wishlistItems[itemIndex];
          
          if (!item.inStock) {
            observer.error({ message: 'Item is out of stock' });
            return;
          }

          const cartItem: CartItem = {
            id: item.id,
            name: item.name,
            brand: item.brand,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: 1,
            size: item.size,
            color: item.color,
            image: item.image,
            sku: item.sku,
            inStock: item.inStock,
            category: item.category
          };

          // Add to cart
          const cartItems = [...this.cartItems];
          const existingCartItemIndex = cartItems.findIndex(cartItemExisting => 
            cartItemExisting.id === item.id && 
            cartItemExisting.size === item.size && 
            cartItemExisting.color === item.color
          );

          if (existingCartItemIndex > -1) {
            cartItems[existingCartItemIndex].quantity += 1;
          } else {
            cartItems.push(cartItem);
          }

          this.cartItemsSubject.next(cartItems);
          this.calculateTotals();
          this.saveCartToStorage();

          // Remove from wishlist
          wishlistItems.splice(itemIndex, 1);
          this.wishlistItemsSubject.next(wishlistItems);
          this.saveWishlistToStorage();
        }

        observer.next();
        observer.complete();
      }, 500);
    });
  }

  addAllWishlistToCart(): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const wishlistItems = [...this.wishlistItems];
        const cartItems = [...this.cartItems];
        const itemsToRemove: number[] = [];

        wishlistItems.forEach((item, index) => {
          if (item.inStock) {
            const cartItem: CartItem = {
              id: item.id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              originalPrice: item.originalPrice,
              quantity: 1,
              size: item.size,
              color: item.color,
              image: item.image,
              sku: item.sku,
              inStock: item.inStock,
              category: item.category
            };

            const existingCartItemIndex = cartItems.findIndex(cartItemExisting => 
              cartItemExisting.id === item.id && 
              cartItemExisting.size === item.size && 
              cartItemExisting.color === item.color
            );

            if (existingCartItemIndex > -1) {
              cartItems[existingCartItemIndex].quantity += 1;
            } else {
              cartItems.push(cartItem);
            }

            itemsToRemove.push(index);
          }
        });

        // Remove items from wishlist (in reverse order to maintain indices)
        itemsToRemove.reverse().forEach(index => {
          wishlistItems.splice(index, 1);
        });

        this.cartItemsSubject.next(cartItems);
        this.wishlistItemsSubject.next(wishlistItems);
        this.calculateTotals();
        this.saveCartToStorage();
        this.saveWishlistToStorage();

        observer.next();
        observer.complete();
      }, 1000);
    });
  }

  // Utility methods
  getCartSummary(): Observable<CartSummary> {
    return new Observable<CartSummary>(observer => {
      setTimeout(() => {
        const subtotal = this.totalAmount;
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        const discount = 0; // Could be calculated based on coupons
        
        const summary: CartSummary = {
          totalItems: this.totalItems,
          totalAmount: subtotal + tax + shipping - discount,
          subtotal,
          tax,
          shipping,
          discount
        };

        observer.next(summary);
        observer.complete();
      }, 200);
    });
  }

  isInCart(productId: number, size?: string, color?: string): boolean {
    return this.cartItems.some(item => 
      item.id === productId && item.size === size && item.color === color
    );
  }

  isInWishlist(productId: number, size?: string, color?: string): boolean {
    return this.wishlistItems.some(item => 
      item.id === productId && item.size === size && item.color === color
    );
  }

  getCartItemCount(productId: number, size?: string, color?: string): number {
    const item = this.cartItems.find(item => 
      item.id === productId && item.size === size && item.color === color
    );
    return item ? item.quantity : 0;
  }
}