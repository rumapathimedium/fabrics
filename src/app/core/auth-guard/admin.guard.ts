import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // For now, we'll implement a basic check
    // This will be updated once AuthService is created
    const userRole = this.getUserRole();
    
    if (userRole === 'admin') {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
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
}