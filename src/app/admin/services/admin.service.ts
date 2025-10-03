import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Interfaces
export interface Order {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  orderDate: Date;
  items: OrderItem[];
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Mock data - In a real application, this would come from an API
  private ordersSubject = new BehaviorSubject<Order[]>([
    {
      id: 1,
      customerName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      amount: 129.99,
      status: 'pending',
      orderDate: new Date('2024-10-01'),
      items: [
        { productId: 1, productName: 'Cotton T-Shirt', quantity: 2, price: 29.99 },
        { productId: 3, productName: 'Denim Jeans', quantity: 1, price: 69.99 }
      ]
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0124',
      amount: 89.99,
      status: 'processing',
      orderDate: new Date('2024-10-02'),
      items: [
        { productId: 2, productName: 'Wool Sweater', quantity: 1, price: 89.99 }
      ]
    },
    {
      id: 3,
      customerName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1-555-0125',
      amount: 159.98,
      status: 'completed',
      orderDate: new Date('2024-09-28'),
      items: [
        { productId: 4, productName: 'Summer Dress', quantity: 2, price: 79.99 }
      ]
    }
  ]);

  private productsSubject = new BehaviorSubject<Product[]>([
    {
      id: 1,
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt perfect for everyday wear',
      price: 29.99,
      stock: 150,
      sku: 'CLT-TSH-001',
      category: 'shirts',
      imageUrl: 'https://via.placeholder.com/300x300/007bff/white?text=T-Shirt',
      isActive: true,
      createdDate: new Date('2024-08-15'),
      updatedDate: new Date('2024-10-01')
    },
    {
      id: 2,
      name: 'Wool Sweater',
      description: 'Warm and cozy wool sweater for cold weather',
      price: 89.99,
      stock: 75,
      sku: 'CLT-SWT-001',
      category: 'shirts',
      imageUrl: 'https://via.placeholder.com/300x300/28a745/white?text=Sweater',
      isActive: true,
      createdDate: new Date('2024-08-20'),
      updatedDate: new Date('2024-09-15')
    },
    {
      id: 3,
      name: 'Denim Jeans',
      description: 'Classic blue denim jeans with modern fit',
      price: 69.99,
      stock: 8,
      sku: 'CLT-JNS-001',
      category: 'pants',
      imageUrl: 'https://via.placeholder.com/300x300/6c757d/white?text=Jeans',
      isActive: true,
      createdDate: new Date('2024-08-25'),
      updatedDate: new Date('2024-09-20')
    },
    {
      id: 4,
      name: 'Summer Dress',
      description: 'Light and breezy summer dress for warm days',
      price: 79.99,
      stock: 0,
      sku: 'CLT-DRS-001',
      category: 'dresses',
      imageUrl: 'https://via.placeholder.com/300x300/dc3545/white?text=Dress',
      isActive: true,
      createdDate: new Date('2024-09-01'),
      updatedDate: new Date('2024-09-25')
    },
    {
      id: 5,
      name: 'Running Shoes',
      description: 'Comfortable running shoes for active lifestyle',
      price: 129.99,
      stock: 45,
      sku: 'CLT-SHO-001',
      category: 'shoes',
      imageUrl: 'https://via.placeholder.com/300x300/ffc107/black?text=Shoes',
      isActive: false,
      createdDate: new Date('2024-09-05'),
      updatedDate: new Date('2024-09-30')
    }
  ]);

  private nextOrderId = 4;
  private nextProductId = 6;

  constructor() {}

  // Order Management Methods
  getAllOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable().pipe(delay(500));
  }

  getOrderById(id: number): Observable<Order | undefined> {
    return this.ordersSubject.asObservable().pipe(
      map(orders => orders.find(order => order.id === id)),
      delay(300)
    );
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    const newOrder: Order = {
      id: this.nextOrderId++,
      customerName: orderData.customerName || '',
      email: orderData.email || '',
      phone: orderData.phone || '',
      amount: orderData.amount || 0,
      status: orderData.status || 'pending',
      orderDate: new Date(),
      items: orderData.items || []
    };

    const currentOrders = this.ordersSubject.value;
    this.ordersSubject.next([...currentOrders, newOrder]);
    
    return of(newOrder).pipe(delay(500));
  }

  updateOrder(id: number, orderData: Partial<Order>): Observable<Order> {
    const currentOrders = this.ordersSubject.value;
    const orderIndex = currentOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const updatedOrder = { ...currentOrders[orderIndex], ...orderData };
    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    
    this.ordersSubject.next(updatedOrders);
    
    return of(updatedOrder).pipe(delay(500));
  }

  deleteOrder(id: number): Observable<boolean> {
    const currentOrders = this.ordersSubject.value;
    const filteredOrders = currentOrders.filter(order => order.id !== id);
    
    this.ordersSubject.next(filteredOrders);
    
    return of(true).pipe(delay(500));
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.updateOrder(id, { status });
  }

  getOrdersCount(): Observable<number> {
    return this.ordersSubject.asObservable().pipe(
      map(orders => orders.length),
      delay(200)
    );
  }

  getRecentOrders(limit: number = 5): Observable<Order[]> {
    return this.ordersSubject.asObservable().pipe(
      map(orders => orders
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, limit)
      ),
      delay(300)
    );
  }

  // Product Management Methods
  getAllProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable().pipe(delay(500));
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.productsSubject.asObservable().pipe(
      map(products => products.find(product => product.id === id)),
      delay(300)
    );
  }

  createProduct(productData: Partial<Product>): Observable<Product> {
    const newProduct: Product = {
      id: this.nextProductId++,
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || 0,
      stock: productData.stock || 0,
      sku: productData.sku || '',
      category: productData.category || '',
      imageUrl: productData.imageUrl,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, newProduct]);
    
    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: number, productData: Partial<Product>): Observable<Product> {
    const currentProducts = this.productsSubject.value;
    const productIndex = currentProducts.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    const updatedProduct = { 
      ...currentProducts[productIndex], 
      ...productData,
      updatedDate: new Date()
    };
    const updatedProducts = [...currentProducts];
    updatedProducts[productIndex] = updatedProduct;
    
    this.productsSubject.next(updatedProducts);
    
    return of(updatedProduct).pipe(delay(500));
  }

  deleteProduct(id: number): Observable<boolean> {
    const currentProducts = this.productsSubject.value;
    const filteredProducts = currentProducts.filter(product => product.id !== id);
    
    this.productsSubject.next(filteredProducts);
    
    return of(true).pipe(delay(500));
  }

  getProductsCount(): Observable<number> {
    return this.productsSubject.asObservable().pipe(
      map(products => products.filter(p => p.isActive).length),
      delay(200)
    );
  }

  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    return this.productsSubject.asObservable().pipe(
      map(products => products.filter(product => 
        product.isActive && product.stock <= threshold && product.stock > 0
      )),
      delay(300)
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.productsSubject.asObservable().pipe(
      map(products => products.filter(product => 
        product.isActive && product.category === category
      )),
      delay(300)
    );
  }

  searchProducts(term: string): Observable<Product[]> {
    return this.productsSubject.asObservable().pipe(
      map(products => products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.sku.toLowerCase().includes(term.toLowerCase())
      )),
      delay(300)
    );
  }

  // Dashboard Methods
  getDashboardStats(): Observable<{
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
    totalRevenue: number;
  }> {
    return new Observable<{
      totalOrders: number;
      totalProducts: number;
      lowStockCount: number;
      totalRevenue: number;
    }>(observer => {
      Promise.all([
        this.getOrdersCount().toPromise(),
        this.getProductsCount().toPromise(),
        this.getLowStockProducts().toPromise(),
        this.getAllOrders().toPromise()
      ]).then(([totalOrders, totalProducts, lowStockProducts, orders]) => {
        const totalRevenue = (orders || [])
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + order.amount, 0);

        observer.next({
          totalOrders: totalOrders || 0,
          totalProducts: totalProducts || 0,
          lowStockCount: (lowStockProducts || []).length,
          totalRevenue
        });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    }).pipe(delay(400));
  }
}