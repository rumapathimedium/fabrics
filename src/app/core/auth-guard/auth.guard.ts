import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const isAuthenticated = this.checkAuthentication();
    
    if (isAuthenticated) {
      return true;
    } else {
      // Store the attempted URL for redirecting after login
      this.setRedirectUrl(state.url);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

  private checkAuthentication(): boolean {
    // Temporary implementation - will be updated when AuthService is fully integrated
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  private setRedirectUrl(url: string): void {
    try {
      localStorage.setItem('redirect_url', url);
    } catch (error) {
      console.error('Error setting redirect URL:', error);
    }
  }
}