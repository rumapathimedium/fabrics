import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo">
            <i class="fas fa-store"></i>
            <span *ngIf="!sidebarCollapsed">Admin Panel</span>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <i class="fas fa-bars"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item">
              <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
                <i class="fas fa-chart-bar"></i>
                <span *ngIf="!sidebarCollapsed">Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/admin/orders" routerLinkActive="active" class="nav-link">
                <i class="fas fa-shopping-cart"></i>
                <span *ngIf="!sidebarCollapsed">Orders</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/admin/products" routerLinkActive="active" class="nav-link">
                <i class="fas fa-box"></i>
                <span *ngIf="!sidebarCollapsed">Products</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
                <i class="fas fa-users"></i>
                <span *ngIf="!sidebarCollapsed">Users</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/admin/analytics" routerLinkActive="active" class="nav-link">
                <i class="fas fa-chart-line"></i>
                <span *ngIf="!sidebarCollapsed">Analytics</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/admin/settings" routerLinkActive="active" class="nav-link">
                <i class="fas fa-cog"></i>
                <span *ngIf="!sidebarCollapsed">Settings</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span *ngIf="!sidebarCollapsed">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="top-bar-left">
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>
          <div class="top-bar-right">
            <div class="user-menu">
              <div class="user-info">
                <img [src]="currentUser?.avatar || '/assets/default-avatar.png'" 
                     [alt]="currentUser?.firstName" 
                     class="user-avatar">
                <span class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Router Outlet -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      background-color: #f8f9fa;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 250px;
      background-color: #2c3e50;
      color: white;
      transition: width 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #34495e;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .logo i {
      font-size: 1.5rem;
      color: #3498db;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .toggle-btn:hover {
      background-color: #34495e;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: 0.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #bdc3c7;
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-link:hover {
      background-color: #34495e;
      color: white;
    }

    .nav-link.active {
      background-color: #3498db;
      color: white;
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: #2980b9;
    }

    .nav-link i {
      width: 20px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #34495e;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem;
      background: none;
      border: none;
      color: #e74c3c;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .logout-btn:hover {
      background-color: #34495e;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-bar {
      background: white;
      border-bottom: 1px solid #e9ecef;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .user-menu {
      display: flex;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #3498db;
    }

    .user-name {
      font-weight: 500;
      color: #2c3e50;
    }

    .content-area {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 1000;
        transform: translateX(-100%);
      }

      .sidebar.collapsed {
        transform: translateX(-100%);
      }

      .sidebar:not(.collapsed) {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
      }

      .top-bar {
        padding: 1rem;
      }

      .content-area {
        padding: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  pageTitle = 'Dashboard';
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      // Navigation will be handled by the auth service
    });
  }
}