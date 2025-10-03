import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  address?: Address;
  memberSince: Date;
  preferredLanguage: string;
  preferredCurrency: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  wishlistItems: number;
  rewardPoints: number;
  nextDelivery?: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variant: string;
  quantity: number;
  price: number;
  total: number;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  language: string;
  currency: string;
  timezone: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/user'; // Replace with actual API URL
  private userSubject = new BehaviorSubject<User | null>(null);
  
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // User Profile Methods
  getProfile(): Observable<User> {
    // Mock implementation - replace with actual API call
    return of(this.generateMockUser()).pipe(delay(500));
    // return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    // Mock implementation
    return of({ ...this.generateMockUser(), ...userData } as User).pipe(delay(300));
    // return this.http.put<User>(`${this.apiUrl}/profile`, userData);
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Mock implementation
    return of({ avatarUrl: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 20) }).pipe(delay(1000));
    // return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/avatar`, formData);
  }

  // Dashboard Methods
  getDashboardStats(): Observable<DashboardStats> {
    // Mock implementation
    return of({
      totalOrders: 12,
      totalSpent: 1234.56,
      pendingOrders: 2,
      wishlistItems: 8,
      rewardPoints: 450,
      nextDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    }).pipe(delay(300));
    // return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getRecentOrders(limit: number = 5): Observable<Order[]> {
    // Mock implementation
    return of(this.generateMockOrders().slice(0, limit)).pipe(delay(400));
    // return this.http.get<Order[]>(`${this.apiUrl}/orders/recent?limit=${limit}`);
  }

  // Order Methods
  getOrders(page: number = 1, limit: number = 10): Observable<{ orders: Order[], total: number }> {
    const mockOrders = this.generateMockOrders();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return of({
      orders: mockOrders.slice(startIndex, endIndex),
      total: mockOrders.length
    }).pipe(delay(500));
    // return this.http.get<{ orders: Order[], total: number }>(`${this.apiUrl}/orders?page=${page}&limit=${limit}`);
  }

  getOrder(orderId: string): Observable<Order> {
    const mockOrders = this.generateMockOrders();
    const order = mockOrders.find(o => o.id === orderId);
    
    return of(order || mockOrders[0]).pipe(delay(300));
    // return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`);
  }

  cancelOrder(orderId: string): Observable<void> {
    return of(void 0).pipe(delay(500));
    // return this.http.post<void>(`${this.apiUrl}/orders/${orderId}/cancel`, {});
  }

  trackOrder(orderId: string): Observable<any> {
    return of({
      orderId,
      trackingNumber: 'TRK123456789',
      status: 'shipped',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      trackingEvents: [
        { date: new Date(), status: 'Order placed', location: 'Online' },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'Processing', location: 'Warehouse' },
        { date: new Date(Date.now() - 12 * 60 * 60 * 1000), status: 'Shipped', location: 'Distribution Center' }
      ]
    }).pipe(delay(400));
    // return this.http.get(`${this.apiUrl}/orders/${orderId}/tracking`);
  }

  // Address Methods
  getAddresses(): Observable<Address[]> {
    return of(this.generateMockAddresses()).pipe(delay(300));
    // return this.http.get<Address[]>(`${this.apiUrl}/addresses`);
  }

  addAddress(address: Omit<Address, 'id'>): Observable<Address> {
    return of({ ...address, id: Date.now().toString() } as Address).pipe(delay(400));
    // return this.http.post<Address>(`${this.apiUrl}/addresses`, address);
  }

  updateAddress(addressId: string, address: Partial<Address>): Observable<Address> {
    return of({ ...this.generateMockAddresses()[0], ...address, id: addressId } as Address).pipe(delay(300));
    // return this.http.put<Address>(`${this.apiUrl}/addresses/${addressId}`, address);
  }

  deleteAddress(addressId: string): Observable<void> {
    return of(void 0).pipe(delay(300));
    // return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }

  // Preferences Methods
  getPreferences(): Observable<UserPreferences> {
    return of({
      notifications: {
        email: true,
        sms: false,
        push: true,
        orderUpdates: true,
        promotions: true,
        newsletter: false
      },
      privacy: {
        profileVisibility: 'private' as const,
        showEmail: false,
        showPhone: false
      },
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York'
    }).pipe(delay(300));
    // return this.http.get<UserPreferences>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    // Mock implementation - merge with existing preferences
    return this.getPreferences().pipe(
      map(existing => ({ ...existing, ...preferences })),
      delay(400)
    );
    // return this.http.put<UserPreferences>(`${this.apiUrl}/preferences`, preferences);
  }

  // Security Methods
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return of(void 0).pipe(delay(500));
    // return this.http.post<void>(`${this.apiUrl}/change-password`, { currentPassword, newPassword });
  }

  enableTwoFactor(): Observable<{ qrCode: string, backupCodes: string[] }> {
    return of({
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      backupCodes: ['12345678', '87654321', '11111111', '22222222', '33333333']
    }).pipe(delay(500));
    // return this.http.post<{ qrCode: string, backupCodes: string[] }>(`${this.apiUrl}/two-factor/enable`, {});
  }

  disableTwoFactor(password: string): Observable<void> {
    return of(void 0).pipe(delay(500));
    // return this.http.post<void>(`${this.apiUrl}/two-factor/disable`, { password });
  }

  // Mock Data Generators
  private generateMockUser(): User {
    return {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://i.pravatar.cc/150?img=1',
      dateOfBirth: new Date('1990-01-15'),
      memberSince: new Date('2023-01-01'),
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: false
    };
  }

  private generateMockOrders(): Order[] {
    const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const orders: Order[] = [];

    for (let i = 1; i <= 15; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Random date within last 90 days
      
      orders.push({
        id: `order-${i}`,
        orderNumber: `ORD-${1000 + i}`,
        date,
        status,
        total: Math.floor(Math.random() * 300) + 50,
        items: this.generateMockOrderItems(),
        shippingAddress: this.generateMockAddresses()[0],
        billingAddress: this.generateMockAddresses()[0],
        paymentMethod: 'Credit Card ending in 1234',
        trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
        estimatedDelivery: status === 'pending' || status === 'processing' || status === 'shipped' ? 
          new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
      });
    }

    return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private generateMockOrderItems(): OrderItem[] {
    const products = [
      { name: 'Classic T-Shirt', image: 'https://picsum.photos/100/100?random=1' },
      { name: 'Denim Jeans', image: 'https://picsum.photos/100/100?random=2' },
      { name: 'Sneakers', image: 'https://picsum.photos/100/100?random=3' },
      { name: 'Hooded Sweatshirt', image: 'https://picsum.photos/100/100?random=4' }
    ];

    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items: OrderItem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = Math.floor(Math.random() * 100) + 20;

      items.push({
        id: `item-${i + 1}`,
        productId: `product-${i + 1}`,
        productName: product.name,
        productImage: product.image,
        variant: 'Size M, Color Blue',
        quantity,
        price,
        total: price * quantity
      });
    }

    return items;
  }

  private generateMockAddresses(): Address[] {
    return [
      {
        id: 'addr-1',
        type: 'home',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        isDefault: true
      },
      {
        id: 'addr-2',
        type: 'work',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Tech Corp',
        addressLine1: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'US',
        isDefault: false
      }
    ];
  }
}