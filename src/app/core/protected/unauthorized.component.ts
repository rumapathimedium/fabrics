import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="icon-container">
          <i class="fas fa-lock"></i>
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div class="actions">
          <button class="btn btn-primary" routerLink="/user/dashboard">
            Go to Dashboard
          </button>
          <button class="btn btn-secondary" routerLink="/auth/login">
            Login
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 2rem;
    }

    .unauthorized-content {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .icon-container {
      margin-bottom: 2rem;
    }

    .icon-container i {
      font-size: 4rem;
      color: #dc3545;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .unauthorized-content {
        padding: 2rem;
      }

      .actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class UnauthorizedComponent {}