import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from localStorage
    const authToken = this.getAuthToken();

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (authToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Handle the request and catch auth errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.handleUnauthorized();
        } else if (error.status === 403) {
          // Forbidden - redirect to unauthorized page
          this.handleForbidden();
        }
        return throwError(() => error);
      })
    );
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error reading auth token:', error);
      return null;
    }
  }

  private handleUnauthorized(): void {
    // Clear stored authentication data
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }

    // Redirect to login page
    this.router.navigate(['/auth/login']);
  }

  private handleForbidden(): void {
    // Redirect to unauthorized page or dashboard based on user role
    const userRole = this.getUserRole();
    if (userRole === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (userRole === 'user') {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  private getUserRole(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.role?.name || 'user';
      }
    } catch (error) {
      console.error('Error reading user data:', error);
    }
    return 'guest';
  }
}