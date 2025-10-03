import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      // No specific roles required, allow access
      return true;
    }

    const userRole = this.getUserRole();
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (hasRequiredRole) {
      return true;
    } else {
      // User doesn't have required role
      this.handleUnauthorizedAccess(userRole);
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
    return 'guest';
  }

  private handleUnauthorizedAccess(userRole: string): void {
    // Redirect based on user role
    switch (userRole) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'user':
        this.router.navigate(['/user/dashboard']);
        break;
      case 'guest':
      default:
        this.router.navigate(['/auth/login']);
        break;
    }
  }
}