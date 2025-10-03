# Authentication Module

This authentication module provides a complete authentication system for the Cloth application with login, registration, forgot password, and reset password functionality.

## Project Structure

```
src/app/auth/
├── auth.module.ts                    # Main auth module
├── auth-routing.module.ts           # Auth routing configuration
├── components/
│   ├── login/                       # Login component
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.scss
│   ├── registration/                # Registration component
│   │   ├── registration.component.ts
│   │   ├── registration.component.html
│   │   └── registration.component.scss
│   ├── forgot-password/             # Forgot password component
│   │   ├── forgot-password.component.ts
│   │   ├── forgot-password.component.html
│   │   └── forgot-password.component.scss
│   ├── reset-password/              # Reset password component
│   │   ├── reset-password.component.ts
│   │   ├── reset-password.component.html
│   │   └── reset-password.component.scss
│   └── index.ts                     # Component exports
└── services/
    ├── auth.service.ts              # Authentication service
    └── index.ts                     # Service exports
```

## Features

### Login Component
- Email and password authentication
- Remember me functionality
- Password visibility toggle
- Form validation with error messages
- Loading states
- Responsive design

### Registration Component
- Multi-step registration form
- Password strength indicator
- Password confirmation validation
- Phone number validation (optional)
- Terms and conditions acceptance
- Real-time form validation
- Success/error handling

### Forgot Password Component
- Email-based password reset request
- Email validation
- Success confirmation screen
- Resend email functionality
- Instructions and guidance

### Reset Password Component
- Token-based password reset
- Password strength requirements
- Password confirmation
- Success confirmation
- Invalid token handling
- Auto-redirect to login

### Authentication Service
- Mock authentication for development
- JWT-like token management
- User session management
- Role-based authentication (admin/user)
- Local storage integration
- Reactive state management with RxJS

## Authentication Flow

### Login Flow
1. User enters email and password
2. Service validates credentials against mock data
3. On success: generates token, stores in localStorage, updates auth state
4. Redirects to admin dashboard
5. On failure: displays error message

### Registration Flow
1. User fills registration form with validation
2. Service checks for existing email
3. Creates new user account
4. Shows success message
5. Redirects to login page

### Password Reset Flow
1. User requests password reset with email
2. Service validates email exists
3. Simulates sending reset email
4. User clicks reset link (with token)
5. User creates new password
6. Redirects to login page

## Technical Implementation

### Angular 18 Features Used
- **Standalone Components**: All components are standalone
- **Reactive Forms**: Form validation and management
- **Form Builders**: Dynamic form creation
- **Custom Validators**: Password strength and matching validation
- **Route Guards**: Can be extended for protection
- **Dependency Injection**: Modern `inject()` function usage

### Service Features
- **BehaviorSubject**: Reactive auth state management
- **Observable Patterns**: Async operations with proper error handling
- **Local Storage**: Token and user data persistence
- **Mock Data**: Development-friendly authentication
- **Type Safety**: Full TypeScript interfaces

### Validation Features
- **Email Validation**: Built-in email validators
- **Password Strength**: Custom validator for complex passwords
- **Password Matching**: Cross-field validation
- **Phone Number**: International phone format validation
- **Required Fields**: Comprehensive form validation

## Routes

- `/auth` - Redirects to login
- `/auth/login` - Login page
- `/auth/registration` - Registration page
- `/auth/forgot-password` - Forgot password page
- `/auth/reset-password?token=xyz` - Reset password page with token

## Data Models

### User Interface
```typescript
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}
```

### Auth State
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
```

## Mock Credentials

### Admin Account
- **Email**: admin@cloth.com
- **Password**: Admin123!
- **Role**: admin

### User Account
- **Email**: john.doe@example.com
- **Password**: User123!
- **Role**: user

## Usage Examples

### Check Authentication Status
```typescript
constructor(private authService: AuthService) {
  this.authService.isAuthenticated$.subscribe(isAuth => {
    console.log('User is authenticated:', isAuth);
  });
}
```

### Get Current User
```typescript
this.authService.currentUser$.subscribe(user => {
  if (user) {
    console.log('Current user:', user.firstName, user.lastName);
  }
});
```

### Login
```typescript
this.authService.login(email, password, rememberMe).subscribe({
  next: (response) => {
    console.log('Login successful:', response.user);
    // Redirect to dashboard
  },
  error: (error) => {
    console.error('Login failed:', error.message);
  }
});
```

### Check User Role
```typescript
if (this.authService.isAdmin()) {
  // Show admin features
}
```

## Styling

### Design System
- **Colors**: Professional gradient backgrounds (purple to blue)
- **Typography**: Modern font stack with proper hierarchy
- **Animations**: Subtle bouncing icons and smooth transitions
- **Responsive**: Mobile-first design approach
- **Components**: Consistent button and form styling

### Mobile Responsiveness
- **Breakpoint**: 480px for mobile optimization
- **Layout**: Stacked forms on small screens
- **Touch**: Properly sized interactive elements
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Security Considerations

### Current Implementation (Development)
- Mock authentication with localStorage
- Client-side token storage
- No encryption or secure headers

### Production Recommendations
- Replace with real authentication service
- Implement JWT tokens with proper validation
- Use HttpOnly cookies for token storage
- Add CSRF protection
- Implement rate limiting
- Add password hashing (bcrypt)
- Use HTTPS only
- Implement proper session management

## Future Enhancements

- Email verification functionality
- Social login integration (Google, Facebook)
- Two-factor authentication (2FA)
- Account lockout after failed attempts
- Password history tracking
- OAuth2/OpenID Connect integration
- Role-based access control (RBAC)
- Audit logging
- Account management features