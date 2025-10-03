import { Address } from './user.model';
import { ProductVariant, ProductDimensions } from './product.model';

// Cart related interfaces
export interface CartItem {
  id: string;
  productId: string;
  product: CartProduct;
  quantity: number;
  selectedVariants: SelectedVariant[];
  pricePerItem: number;
  totalPrice: number;
  addedAt: Date;
  updatedAt: Date;
}

export interface CartProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  sku: string;
  inStock: boolean;
  stockQuantity: number;
  variants: ProductVariant[];
}

export interface SelectedVariant {
  type: string;
  value: string;
  priceModifier?: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
  couponCode?: string;
  shippingMethod?: ShippingMethod;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: CartProduct;
  addedAt: Date;
  priceWhenAdded: number;
  isOnSale: boolean;
  stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock';
}

// Order related interfaces
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  selectedVariants: SelectedVariant[];
  status: OrderItemStatus;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned';

export type OrderItemStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderStatusUpdate {
  status: OrderStatus;
  message: string;
  timestamp: Date;
  updatedBy?: string;
}

export interface OrderTracking {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: OrderStatus;
  estimatedDelivery: Date;
  trackingEvents: TrackingEvent[];
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: Date;
}

// Payment related interfaces
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  name: string;
  details: PaymentDetails;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface PaymentDetails {
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  last4Digits?: string;
  brand?: string;
  paypalEmail?: string;
  bankAccount?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: any;
  processedAt?: Date;
  refundedAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

// Shipping related interfaces
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  trackingAvailable: boolean;
  isActive: boolean;
  restrictions?: ShippingRestrictions;
}

export interface ShippingRestrictions {
  countries?: string[];
  states?: string[];
  maxWeight?: number;
  maxDimensions?: ProductDimensions;
}

// Coupon and discount interfaces
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: Date;
}