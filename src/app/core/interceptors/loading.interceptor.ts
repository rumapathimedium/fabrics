import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Observable to track loading state
  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading indicator for certain requests
    if (this.shouldSkipLoading(req)) {
      return next.handle(req);
    }

    // Increment active requests counter
    this.activeRequests++;
    this.updateLoadingState();

    return next.handle(req).pipe(
      finalize(() => {
        // Decrement active requests counter
        this.activeRequests--;
        this.updateLoadingState();
      })
    );
  }

  private shouldSkipLoading(req: HttpRequest<any>): boolean {
    // Skip loading for certain endpoints or request types
    const skipEndpoints = [
      '/api/health',
      '/api/ping',
      '/api/analytics'
    ];

    // Skip loading if request has custom header
    if (req.headers.has('X-Skip-Loading')) {
      return true;
    }

    // Skip loading for specific endpoints
    return skipEndpoints.some(endpoint => req.url.includes(endpoint));
  }

  private updateLoadingState(): void {
    const isLoading = this.activeRequests > 0;
    this.loadingSubject.next(isLoading);
  }

  // Public method to get current loading state
  public isLoading(): boolean {
    return this.activeRequests > 0;
  }

  // Public method to get active requests count
  public getActiveRequestsCount(): number {
    return this.activeRequests;
  }
}