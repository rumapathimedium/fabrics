import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Check if user is already authenticated
    const isAuthenticated = this.checkAuthentication();
    
    if (!isAuthenticated) {
      // User is not authenticated, allow access to guest routes (login, register)
      return true;
    } else {
      // User is already authenticated, redirect to dashboard
      const userRole = this.getUserRole();
      if (userRole === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/user/dashboard']);
      }
      return false;
    }
  }

  private checkAuthentication(): boolean {
    // Temporary implementation - will be replaced with AuthService
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  private getUserRole(): string {
    // Temporary implementation - will be replaced with AuthService
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.role?.name || 'user';
      }
    } catch (error) {
      console.error('Error reading user data:', error);
    }
    return 'user';
  }
}