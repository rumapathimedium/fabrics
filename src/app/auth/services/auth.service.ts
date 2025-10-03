import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

// Interfaces
export interface User {
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

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Mock users for development
  private mockUsers: User[] = [
    {
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@cloth.com',
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date()
    },
    {
      id: 2,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'user',
      isEmailVerified: true,
      createdAt: new Date('2024-06-01'),
      lastLoginAt: new Date()
    }
  ];

  // Mock passwords (in real app, these would be hashed)
  private mockPasswords: {[email: string]: string} = {
    'admin@cloth.com': 'Admin123!',
    'john.doe@example.com': 'User123!'
  };

  private nextUserId = 3;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check for existing session on service initialization
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Only access localStorage if we're running in the browser
    const token = this.getFromStorage('auth_token');
    const userStr = this.getFromStorage('auth_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          token
        });
      } catch (error) {
        // Clear invalid data
        this.clearAuthData();
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

  private clearAuthData(): void {
    this.removeFromStorage('auth_token');
    this.removeFromStorage('auth_user');
    this.removeFromStorage('auth_refresh_token');
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  // Public observables
  get authState$(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authStateSubject.pipe(map(state => state.isAuthenticated));
  }

  get currentUser$(): Observable<User | null> {
    return this.authStateSubject.pipe(map(state => state.user));
  }

  // Getters for current state
  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  get currentToken(): string | null {
    return this.authStateSubject.value.token;
  }

  // Authentication methods
  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return new Observable<LoginResponse>(observer => {
      // Simulate API delay
      setTimeout(() => {
        const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        const expectedPassword = this.mockPasswords[email.toLowerCase()];

        if (!user || password !== expectedPassword) {
          observer.error({ message: 'Invalid email or password' });
          return;
        }

        // Generate tokens
        const token = this.generateToken();
        const refreshToken = this.generateToken();

        // Update user's last login
        user.lastLoginAt = new Date();

        const response: LoginResponse = {
          user,
          token,
          refreshToken,
          expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
        };

        // Store auth data
        this.setToStorage('auth_token', token);
        this.setToStorage('auth_user', JSON.stringify(user));
        this.setToStorage('auth_refresh_token', refreshToken);

        if (rememberMe) {
          this.setToStorage('auth_remember', 'true');
        }

        // Update auth state
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          token
        });

        observer.next(response);
        observer.complete();
      }, 1500); // Simulate network delay
    });
  }

  register(userData: RegisterRequest): Observable<{message: string}> {
    return new Observable<{message: string}>(observer => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = this.mockUsers.find(u => 
          u.email.toLowerCase() === userData.email.toLowerCase()
        );

        if (existingUser) {
          observer.error({ message: 'Email address is already registered' });
          return;
        }

        // Create new user
        const newUser: User = {
          id: this.nextUserId++,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          role: 'user',
          isEmailVerified: false,
          createdAt: new Date()
        };

        // Add to mock database
        this.mockUsers.push(newUser);
        this.mockPasswords[userData.email.toLowerCase()] = userData.password;

        observer.next({ message: 'Registration successful' });
        observer.complete();
      }, 2000);
    });
  }

  forgotPassword(email: string): Observable<{message: string}> {
    return new Observable<{message: string}>(observer => {
      setTimeout(() => {
        const user = this.mockUsers.find(u => 
          u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
          observer.error({ message: 'No account found with this email address' });
          return;
        }

        // In a real app, you would send an email with a reset token
        observer.next({ message: 'Password reset email sent successfully' });
        observer.complete();
      }, 1500);
    });
  }

  resetPassword(token: string, newPassword: string): Observable<{message: string}> {
    return new Observable<{message: string}>(observer => {
      setTimeout(() => {
        // In a real app, you would validate the reset token
        if (!token || token.length < 10) {
          observer.error({ message: 'Invalid or expired reset token' });
          return;
        }

        // For demo purposes, assume token is valid
        observer.next({ message: 'Password reset successful' });
        observer.complete();
      }, 1500);
    });
  }

  logout(): Observable<void> {
    return new Observable<void>(observer => {
      // Clear auth data
      this.clearAuthData();

      // Update auth state
      this.authStateSubject.next({
        isAuthenticated: false,
        user: null,
        token: null
      });

      observer.next();
      observer.complete();
    }).pipe(delay(500));
  }

  refreshToken(): Observable<{token: string; expiresIn: number}> {
    const refreshToken = this.getFromStorage('auth_refresh_token');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return new Observable<{token: string; expiresIn: number}>(observer => {
      setTimeout(() => {
        const newToken = this.generateToken();
        
        // Update stored token
        this.setToStorage('auth_token', newToken);
        
        // Update auth state
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          token: newToken
        });

        observer.next({
          token: newToken,
          expiresIn: 24 * 60 * 60 // 1 day
        });
        observer.complete();
      }, 1000);
    });
  }

  // Utility methods
  hasRole(role: 'admin' | 'user'): boolean {
    return this.currentUser?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isUser(): boolean {
    return this.hasRole('user');
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return new Observable<User>(observer => {
      setTimeout(() => {
        const currentUser = this.currentUser;
        if (!currentUser) {
          observer.error({ message: 'User not authenticated' });
          return;
        }

        // Update user data
        const updatedUser = { ...currentUser, ...updates };
        
        // Update in mock database
        const userIndex = this.mockUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          this.mockUsers[userIndex] = updatedUser;
        }

        // Update stored user data
        this.setToStorage('auth_user', JSON.stringify(updatedUser));

        // Update auth state
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          user: updatedUser
        });

        observer.next(updatedUser);
        observer.complete();
      }, 1000);
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{message: string}> {
    return new Observable<{message: string}>(observer => {
      setTimeout(() => {
        const currentUser = this.currentUser;
        if (!currentUser) {
          observer.error({ message: 'User not authenticated' });
          return;
        }

        const storedPassword = this.mockPasswords[currentUser.email.toLowerCase()];
        if (currentPassword !== storedPassword) {
          observer.error({ message: 'Current password is incorrect' });
          return;
        }

        // Update password
        this.mockPasswords[currentUser.email.toLowerCase()] = newPassword;

        observer.next({ message: 'Password changed successfully' });
        observer.complete();
      }, 1500);
    });
  }
}