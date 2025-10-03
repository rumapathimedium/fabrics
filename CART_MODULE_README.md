# Cart Module

This cart module provides a complete shopping cart and wishlist system for the Cloth application with cart management and wishlist functionality.

## Project Structure

```
src/app/cart/
├── cart.module.ts                   # Main cart module
├── cart-routing.module.ts          # Cart routing configuration
├── components/
│   ├── cart/                       # Shopping cart component
│   │   ├── cart.component.ts
│   │   ├── cart.component.html
│   │   └── cart.component.scss
│   ├── wishlist/                   # Wishlist component
│   │   ├── wishlist.component.ts
│   │   ├── wishlist.component.html
│   │   └── wishlist.component.scss
│   └── index.ts                    # Component exports
└── services/
    ├── cart.service.ts             # Cart and wishlist service
    └── index.ts                    # Service exports
```

## Features

### Cart Component
- Add/remove items from cart
- Update item quantities
- Move items to wishlist
- Clear entire cart
- Responsive design with modern UI
- Real-time price calculations
- Tax and shipping calculations
- Proceed to checkout functionality

### Wishlist Component
- Save items for later
- Move items from wishlist to cart
- Remove items from wishlist
- Add all wishlist items to cart
- Clear entire wishlist
- Grid layout with product cards
- Stock availability indicators
- Responsive design

### Cart Service
- Mock data for development
- LocalStorage integration (SSR-safe)
- Reactive state management with RxJS
- Cart and wishlist synchronization
- Quantity management
- Price calculations
- Cross-component communication

## Technical Implementation

### Angular 18 Features Used
- **Standalone Components**: Modern component architecture
- **Reactive State Management**: BehaviorSubject patterns
- **SSR Safe Storage**: Platform detection for localStorage
- **Lazy Loading**: Module-based code splitting
- **TypeScript Strict Mode**: Full type safety

### Service Features
- **BehaviorSubject**: Reactive cart and wishlist state
- **Observable Patterns**: Async operations with proper error handling
- **Local Storage**: Persistent cart and wishlist data
- **Mock Data**: Development-friendly product catalog
- **Type Safety**: Full TypeScript interfaces

## Routes

- `/cart` - Redirects to cart view
- `/cart/cart` - Shopping cart page
- `/cart/wishlist` - Wishlist page

## Data Models

### CartItem Interface
```typescript
interface CartItem {
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
```

### WishlistItem Interface
```typescript
interface WishlistItem {
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
```

## Mock Products

The service includes sample products:
1. **Premium Cotton T-Shirt** - $29.99 (was $39.99)
2. **Denim Jeans** - $79.99 (was $99.99)
3. **Summer Dress** - $89.99 (Out of stock)

## Usage Examples

### Add Item to Cart
```typescript
this.cartService.addToCart(1, 2, 'L', 'Blue').subscribe({
  next: (item) => {
    console.log('Added to cart:', item);
  },
  error: (error) => {
    console.error('Error:', error.message);
  }
});
```

### Get Cart Items
```typescript
this.cartService.cartItems$.subscribe(items => {
  console.log('Cart items:', items);
});
```

### Move to Wishlist
```typescript
this.cartService.moveToWishlist(itemId).subscribe({
  next: () => {
    console.log('Moved to wishlist');
  }
});
```

### Get Total Amount
```typescript
this.cartService.totalAmount$.subscribe(total => {
  console.log('Total amount:', total);
});
```

## Styling

### Design System
- **Colors**: Purple/blue gradients for cart, red/pink for wishlist
- **Typography**: Modern font stack with proper hierarchy
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach
- **Grid Layout**: CSS Grid for responsive product display

### Mobile Responsiveness
- **Breakpoints**: 768px and 480px for different screen sizes
- **Layout**: Stacked components on mobile
- **Touch**: Properly sized interactive elements
- **Accessibility**: ARIA labels and keyboard navigation

## Future Enhancements

- Real backend API integration
- Product recommendations
- Coupon/discount system
- Guest cart functionality
- Cart abandonment recovery
- Advanced filtering and sorting
- Product comparison
- Recently viewed items
- Share wishlist functionality
- Email notifications

## Available URLs

- `http://localhost:4200/cart` - Shopping cart
- `http://localhost:4200/cart/wishlist` - Wishlist

The cart module is now fully integrated with the authentication and admin modules, providing a complete e-commerce experience!