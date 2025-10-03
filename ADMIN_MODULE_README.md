# Cloth Admin Module

This project includes a comprehensive admin module for managing a clothing store with dashboard, order management, and product management capabilities.

## Project Structure

```
src/app/admin/
├── admin.module.ts                    # Main admin module
├── admin-routing.module.ts           # Admin routing configuration
├── components/
│   ├── admin-layout/                 # Main layout with navigation
│   │   ├── admin-layout.component.ts
│   │   ├── admin-layout.component.html
│   │   └── admin-layout.component.scss
│   ├── dashboard/                    # Dashboard with overview stats
│   │   ├── dashboard.component.ts
│   │   ├── dashboard.component.html
│   │   └── dashboard.component.scss
│   ├── order-management/             # Order CRUD operations
│   │   ├── order-management.component.ts
│   │   ├── order-management.component.html
│   │   └── order-management.component.scss
│   ├── product-management/           # Product CRUD operations
│   │   ├── product-management.component.ts
│   │   ├── product-management.component.html
│   │   └── product-management.component.scss
│   └── index.ts                      # Component exports
└── services/
    ├── admin.service.ts              # Service with mock data and CRUD operations
    └── index.ts                      # Service exports
```

## Features

### Dashboard
- Overview statistics (total orders, products, low stock items)
- Recent orders list
- Low stock products alerts
- Refresh functionality

### Order Management
- View all orders in a table format
- Search orders by customer name, email, or order ID
- Filter orders by status
- Create new orders
- Edit existing orders
- Update order status via dropdown
- Delete orders
- Form validation

### Product Management
- Grid view of all products with images
- Search products by name, SKU, or description
- Filter by category and stock level
- Create new products
- Edit existing products
- Toggle product active/inactive status
- Delete products
- Stock level indicators (in stock, low stock, out of stock)
- SKU generator
- Form validation

### Admin Layout
- Responsive navigation sidebar
- Mobile-friendly hamburger menu
- Active route highlighting
- Clean, professional design

## Technical Implementation

### Angular 18 Features Used
- **Standalone Components**: All components are standalone for better modularity
- **Lazy Loading**: Components are lazy-loaded for optimal performance
- **Reactive Forms**: Form validation and management
- **Dependency Injection**: Modern `inject()` function usage
- **TypeScript Strict Mode**: Full type safety

### Services
- **AdminService**: Centralized service for all admin operations
- **Mock Data**: Realistic sample data for development
- **Observable Patterns**: RxJS for async data handling
- **Error Handling**: Comprehensive error handling

### Styling
- **SCSS**: Modern CSS preprocessing
- **Responsive Design**: Mobile-first approach
- **CSS Grid & Flexbox**: Modern layout techniques
- **Custom Components**: Professional UI components

## Routes

- `/admin` - Redirects to dashboard
- `/admin/dashboard` - Admin dashboard
- `/admin/orders` - Order management
- `/admin/products` - Product management

## Data Models

### Order
```typescript
interface Order {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  orderDate: Date;
  items: OrderItem[];
}
```

### Product
```typescript
interface Product {
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
```

## Running the Application

1. Start the development server:
   ```bash
   ng serve
   ```

2. Navigate to `http://localhost:4200/`

3. The application will automatically redirect to the admin dashboard

## Development Notes

- All components use standalone architecture
- Service uses mock data (replace with HTTP calls for production)
- Fully responsive design
- TypeScript strict mode enabled
- Form validation implemented
- Error handling included

## Future Enhancements

- Connect to real backend API
- Add authentication/authorization
- Implement pagination for large datasets
- Add export functionality
- Include more detailed analytics
- Add image upload functionality
- Implement real-time updates