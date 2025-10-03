import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { CartService, CartItem } from '../../cart/services';

// Interfaces
export interface Address {
  id: number;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: number;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  isDefault: boolean;
  lastFourDigits?: string;
  name?: string;
  description?: string;
  expiryMonth?: number;
  expiryYear?: number;
  icon?: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  estimatedDelivery: Date;
}

export interface Order {
  id: string;
  userId: number;
  items: CartItem[];
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  orderSummary: OrderSummary;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDelivery: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private currentAddressSubject = new BehaviorSubject<Address | null>(null);
  private currentPaymentMethodSubject = new BehaviorSubject<PaymentMethod | null>(null);
  private currentShippingMethodSubject = new BehaviorSubject<ShippingMethod | null>(null);
  private orderSummarySubject = new BehaviorSubject<OrderSummary | null>(null);

  // Mock data for development
  private mockAddresses: Address[] = [
    {
      id: 1,
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      streetAddress: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true
    },
    {
      id: 2,
      type: 'billing',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Tech Corp',
      streetAddress: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      isDefault: true
    }
  ];

  private mockPaymentMethods: PaymentMethod[] = [
    {
      id: 1,
      type: 'credit_card',
      cardNumber: '**** **** **** 1234',
      expiryDate: '12/26',
      cvv: '***',
      cardholderName: 'John Doe',
      isDefault: true
    },
    {
      id: 2,
      type: 'debit_card',
      cardNumber: '**** **** **** 5678',
      expiryDate: '08/25',
      cvv: '***',
      cardholderName: 'John Doe',
      isDefault: false
    }
  ];

  private mockShippingMethods: ShippingMethod[] = [
    {
      id: 1,
      name: 'Standard Shipping',
      description: 'Delivery in 5-7 business days',
      price: 9.99,
      estimatedDays: '5-7 days',
      carrier: 'USPS'
    },
    {
      id: 2,
      name: 'Express Shipping',
      description: 'Delivery in 2-3 business days',
      price: 19.99,
      estimatedDays: '2-3 days',
      carrier: 'FedEx'
    },
    {
      id: 3,
      name: 'Overnight Shipping',
      description: 'Next business day delivery',
      price: 39.99,
      estimatedDays: '1 day',
      carrier: 'UPS'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartService
  ) {
    this.initializeCheckout();
  }

  private initializeCheckout(): void {
    // Set default addresses and payment methods
    const defaultShippingAddress = this.mockAddresses.find(addr => addr.type === 'shipping' && addr.isDefault);
    const defaultPaymentMethod = this.mockPaymentMethods.find(pm => pm.isDefault);
    const defaultShippingMethod = this.mockShippingMethods[0]; // Standard shipping as default

    if (defaultShippingAddress) {
      this.currentAddressSubject.next(defaultShippingAddress);
    }
    if (defaultPaymentMethod) {
      this.currentPaymentMethodSubject.next(defaultPaymentMethod);
    }
    this.currentShippingMethodSubject.next(defaultShippingMethod);

    // Calculate initial order summary
    this.updateOrderSummary();
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

  // Public observables
  get currentAddress$(): Observable<Address | null> {
    return this.currentAddressSubject.asObservable();
  }

  get currentPaymentMethod$(): Observable<PaymentMethod | null> {
    return this.currentPaymentMethodSubject.asObservable();
  }

  get currentShippingMethod$(): Observable<ShippingMethod | null> {
    return this.currentShippingMethodSubject.asObservable();
  }

  get orderSummary$(): Observable<OrderSummary | null> {
    return this.orderSummarySubject.asObservable();
  }

  // Getters for current state
  get currentAddress(): Address | null {
    return this.currentAddressSubject.value;
  }

  get currentPaymentMethod(): PaymentMethod | null {
    return this.currentPaymentMethodSubject.value;
  }

  get currentShippingMethod(): ShippingMethod | null {
    return this.currentShippingMethodSubject.value;
  }

  get orderSummary(): OrderSummary | null {
    return this.orderSummarySubject.value;
  }

  // Address methods
  getAddresses(): Observable<Address[]> {
    return of(this.mockAddresses).pipe(delay(300));
  }

  saveAddress(address: Omit<Address, 'id'>): Observable<Address> {
    return new Observable<Address>(observer => {
      setTimeout(() => {
        const newAddress: Address = {
          ...address,
          id: Math.max(...this.mockAddresses.map(a => a.id)) + 1
        };
        this.mockAddresses.push(newAddress);
        observer.next(newAddress);
        observer.complete();
      }, 500);
    });
  }

  updateAddress(id: number, address: Partial<Address>): Observable<Address> {
    return new Observable<Address>(observer => {
      setTimeout(() => {
        const index = this.mockAddresses.findIndex(a => a.id === id);
        if (index > -1) {
          this.mockAddresses[index] = { ...this.mockAddresses[index], ...address };
          observer.next(this.mockAddresses[index]);
          observer.complete();
        } else {
          observer.error(new Error('Address not found'));
        }
      }, 500);
    });
  }

  selectAddress(address: Address): void {
    this.currentAddressSubject.next(address);
    this.updateOrderSummary();
  }

  // Payment methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.mockPaymentMethods).pipe(delay(300));
  }

  savePaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Observable<PaymentMethod> {
    return new Observable<PaymentMethod>(observer => {
      setTimeout(() => {
        const newPaymentMethod: PaymentMethod = {
          ...paymentMethod,
          id: Math.max(...this.mockPaymentMethods.map(pm => pm.id)) + 1
        };
        this.mockPaymentMethods.push(newPaymentMethod);
        observer.next(newPaymentMethod);
        observer.complete();
      }, 500);
    });
  }

  selectPaymentMethod(paymentMethod: PaymentMethod): void {
    this.currentPaymentMethodSubject.next(paymentMethod);
  }

  // Shipping methods
  getShippingMethods(): Observable<ShippingMethod[]> {
    return of(this.mockShippingMethods).pipe(delay(300));
  }

  selectShippingMethod(shippingMethod: ShippingMethod): void {
    this.currentShippingMethodSubject.next(shippingMethod);
    this.updateOrderSummary();
  }

  // Order summary
  private updateOrderSummary(): void {
    const cartItems = this.cartService.cartItems;
    const shippingMethod = this.currentShippingMethod;
    
    if (cartItems.length === 0) {
      this.orderSummarySubject.next(null);
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = shippingMethod ? shippingMethod.price : 0;
    const tax = subtotal * 0.08; // 8% tax
    const discount = 0; // Could be calculated based on coupons
    const total = subtotal + shipping + tax - discount;

    const estimatedDelivery = new Date();
    if (shippingMethod) {
      const days = parseInt(shippingMethod.estimatedDays.split('-')[1] || shippingMethod.estimatedDays.split(' ')[0]);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + days);
    }

    const orderSummary: OrderSummary = {
      items: cartItems,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      estimatedDelivery
    };

    this.orderSummarySubject.next(orderSummary);
  }

  // Place order
  placeOrder(): Observable<Order> {
    return new Observable<Order>(observer => {
      setTimeout(() => {
        const currentAddress = this.currentAddress;
        const currentPaymentMethod = this.currentPaymentMethod;
        const currentShippingMethod = this.currentShippingMethod;
        const orderSummary = this.orderSummary;

        if (!currentAddress || !currentPaymentMethod || !currentShippingMethod || !orderSummary) {
          observer.error(new Error('Missing required checkout information'));
          return;
        }

        const order: Order = {
          id: 'ORD-' + Date.now().toString(),
          userId: 1, // Would be from auth service
          items: orderSummary.items,
          billingAddress: currentAddress,
          shippingAddress: currentAddress,
          paymentMethod: currentPaymentMethod,
          shippingMethod: currentShippingMethod,
          orderSummary,
          status: 'confirmed',
          orderDate: new Date(),
          estimatedDelivery: orderSummary.estimatedDelivery
        };

        // Clear cart after successful order
        this.cartService.clearCart().subscribe();

        observer.next(order);
        observer.complete();
      }, 1500); // Simulate processing time
    });
  }

  // Validate checkout
  validateCheckout(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.currentAddress) {
      errors.push('Please select a shipping address');
    }

    if (!this.currentPaymentMethod) {
      errors.push('Please select a payment method');
    }

    if (!this.currentShippingMethod) {
      errors.push('Please select a shipping method');
    }

    if (!this.orderSummary || this.orderSummary.items.length === 0) {
      errors.push('Your cart is empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Apply coupon
  applyCoupon(couponCode: string): Observable<{ success: boolean; discount: number; message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        // Mock coupon validation
        const validCoupons: { [key: string]: number } = {
          'SAVE10': 0.10,
          'WELCOME20': 0.20,
          'FREESHIP': 0
        };

        if (validCoupons.hasOwnProperty(couponCode.toUpperCase())) {
          const discount = validCoupons[couponCode.toUpperCase()];
          observer.next({
            success: true,
            discount: discount,
            message: `Coupon "${couponCode}" applied successfully!`
          });
        } else {
          observer.next({
            success: false,
            discount: 0,
            message: 'Invalid coupon code'
          });
        }
        observer.complete();
      }, 800);
    });
  }

  // Process payment
  processPayment(paymentData: any): Observable<{ success: boolean; message: string; orderId?: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        // Mock payment processing
        const isSuccess = Math.random() > 0.1; // 90% success rate for demo
        
        if (isSuccess) {
          const orderId = 'ORD-' + Date.now();
          observer.next({
            success: true,
            message: 'Payment processed successfully',
            orderId: orderId
          });
        } else {
          observer.next({
            success: false,
            message: 'Payment failed. Please check your payment details and try again.'
          });
        }
        observer.complete();
      }, 2000); // Simulate processing time
    });
  }
}