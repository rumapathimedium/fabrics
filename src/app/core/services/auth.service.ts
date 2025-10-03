import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  PasswordResetRequest, 
  PasswordReset,
  TokenPayload
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  private readonly REDIRECT_URL_KEY = 'redirect_url';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  // Initialize authentication state on service creation
  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user && this.isTokenValid(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  // Login method
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, response.refreshToken);
          this.redirectAfterLogin();
        }
      }),
      catchError(this.handleAuthError)
    );
  }

  // Register method
  register(registerData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, registerData).pipe(
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, response.refreshToken);
          this.redirectAfterLogin();
        }
      }),
      catchError(this.handleAuthError)
    );
  }

  // Logout method
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.performLogout()),
      catchError(() => {
        // Even if server logout fails, perform client-side logout
        this.performLogout();
        return of(null);
      })
    );
  }

  // Refresh token method
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { 
      refreshToken 
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
        }
      }),
      catchError(error => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  // Password reset request
  requestPasswordReset(request: PasswordResetRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/password/reset-request`, request);
  }

  // Password reset
  resetPassword(resetData: PasswordReset): Observable<any> {
    return this.http.post(`${this.API_URL}/password/reset`, resetData);
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, userData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.setUser(user);
      })
    );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/password/change`, {
      currentPassword,
      newPassword
    });
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Check user role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.name === role;
  }

  // Check user permission
  hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user?.role?.permissions) return false;

    return user.role.permissions.some(permission =>
      permission.resource === resource && 
      (permission.action === action || permission.action === 'manage')
    );
  }

  // Set redirect URL
  setRedirectUrl(url: string): void {
    try {
      localStorage.setItem(this.REDIRECT_URL_KEY, url);
    } catch (error) {
      console.error('Error setting redirect URL:', error);
    }
  }

  // Get and clear redirect URL
  getAndClearRedirectUrl(): string | null {
    try {
      const url = localStorage.getItem(this.REDIRECT_URL_KEY);
      localStorage.removeItem(this.REDIRECT_URL_KEY);
      return url;
    } catch (error) {
      console.error('Error getting redirect URL:', error);
      return null;
    }
  }

  // Private methods
  private setAuthData(user: User, token: string, refreshToken?: string): void {
    this.setUser(user);
    this.setToken(token);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private performLogout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private redirectAfterLogin(): void {
    const redirectUrl = this.getAndClearRedirectUrl();
    const user = this.getCurrentUser();
    
    if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl);
    } else if (user?.role?.name === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/user/dashboard']);
    }
  }

  private handleAuthError = (error: any): Observable<never> => {
    console.error('Authentication error:', error);
    return throwError(() => error);
  };

  // Token management
  private getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  private setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  // User management
  private getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  private setUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }

  // Token validation
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  private decodeToken(token: string): TokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }
}