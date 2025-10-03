import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingInterceptor } from '../interceptors/loading.interceptor';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loading-content">
        <div class="spinner">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <p class="loading-text">Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(2px);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading-content {
      text-align: center;
    }

    .spinner {
      width: 60px;
      height: 60px;
      position: relative;
      margin: 0 auto 1rem;
    }

    .double-bounce1, .double-bounce2 {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #007bff;
      opacity: 0.6;
      position: absolute;
      top: 0;
      left: 0;
      animation: bounce 2.0s infinite ease-in-out;
    }

    .double-bounce2 {
      animation-delay: -1.0s;
    }

    @keyframes bounce {
      0%, 100% {
        transform: scale(0);
      }
      50% {
        transform: scale(1);
      }
    }

    .loading-text {
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
      margin: 0;
    }
  `]
})
export class LoadingComponent implements OnInit, OnDestroy {
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private loadingInterceptor: LoadingInterceptor) {}

  ngOnInit(): void {
    this.loadingInterceptor.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}