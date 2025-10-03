import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  details?: any;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry(this.shouldRetry(req) ? 2 : 0),
      catchError((error: HttpErrorResponse) => {
        const errorInfo = this.handleError(error);
        this.notifyError(errorInfo);
        return throwError(() => errorInfo);
      })
    );
  }

  private shouldRetry(req: HttpRequest<any>): boolean {
    // Only retry GET requests and specific error codes
    return req.method === 'GET';
  }

  private handleError(error: HttpErrorResponse): any {
    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Error';
    let errorDetails: any = null;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      errorTitle = 'Network Error';
      errorDetails = {
        type: 'client',
        message: error.error.message,
        filename: error.error.filename,
        lineno: error.error.lineno
      };
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorTitle = 'Bad Request';
          errorMessage = error.error?.message || 'Invalid request data';
          break;
        case 401:
          errorTitle = 'Unauthorized';
          errorMessage = 'You are not authorized to access this resource';
          break;
        case 403:
          errorTitle = 'Forbidden';
          errorMessage = 'You do not have permission to access this resource';
          break;
        case 404:
          errorTitle = 'Not Found';
          errorMessage = 'The requested resource was not found';
          break;
        case 409:
          errorTitle = 'Conflict';
          errorMessage = error.error?.message || 'A conflict occurred';
          break;
        case 422:
          errorTitle = 'Validation Error';
          errorMessage = 'Please check your input and try again';
          break;
        case 429:
          errorTitle = 'Too Many Requests';
          errorMessage = 'Please wait a moment before trying again';
          break;
        case 500:
          errorTitle = 'Server Error';
          errorMessage = 'An internal server error occurred';
          break;
        case 502:
          errorTitle = 'Bad Gateway';
          errorMessage = 'Server is temporarily unavailable';
          break;
        case 503:
          errorTitle = 'Service Unavailable';
          errorMessage = 'Service is temporarily unavailable';
          break;
        case 504:
          errorTitle = 'Gateway Timeout';
          errorMessage = 'Request timed out. Please try again';
          break;
        default:
          errorTitle = `Error ${error.status}`;
          errorMessage = error.error?.message || error.message || 'An unexpected error occurred';
      }

      errorDetails = {
        type: 'server',
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        headers: error.headers,
        body: error.error
      };
    }

    return {
      title: errorTitle,
      message: errorMessage,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      details: errorDetails,
      originalError: error
    };
  }

  private notifyError(errorInfo: any): void {
    // Create error notification
    const notification: ErrorNotification = {
      id: this.generateId(),
      type: this.getNotificationType(errorInfo.status),
      title: errorInfo.title,
      message: errorInfo.message,
      timestamp: new Date(),
      details: errorInfo.details
    };

    // In a real app, you would send this to a notification service
    // For now, we'll just log it
    console.error('HTTP Error:', notification);

    // You could also show a toast notification here
    this.showToastNotification(notification);
  }

  private getNotificationType(status: number): 'error' | 'warning' | 'info' {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warning';
    return 'info';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private showToastNotification(notification: ErrorNotification): void {
    // In a real app, you would integrate with a toast/notification library
    // For now, we'll just create a simple browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/error.png'
      });
    }
  }
}