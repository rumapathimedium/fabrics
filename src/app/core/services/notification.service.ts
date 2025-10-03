import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { Notification as AppNotification, NotificationAction } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<AppNotification[]>([]);
  private nextId = 1;

  public notifications$ = this.notifications.asObservable();

  constructor() {
    this.requestNotificationPermission();
  }

  // Show success notification
  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  // Show error notification
  showError(title: string, message: string, persistent: boolean = false): void {
    this.show({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? 0 : 8000
    });
  }

  // Show warning notification
  showWarning(title: string, message: string, duration: number = 6000): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  // Show info notification
  showInfo(title: string, message: string, duration: number = 4000): void {
    this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  // Show notification with actions
  showWithActions(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    actions: NotificationAction[],
    duration: number = 0
  ): void {
    this.show({
      type,
      title,
      message,
      actions,
      duration,
      persistent: duration === 0
    });
  }

  // Generic show method
  show(notificationData: Partial<AppNotification>): void {
    const notification: AppNotification = {
      id: this.generateId(),
      type: notificationData.type || 'info',
      title: notificationData.title || '',
      message: notificationData.message || '',
      duration: notificationData.duration ?? 5000,
      actions: notificationData.actions || [],
      createdAt: new Date(),
      read: false,
      persistent: notificationData.persistent || false
    };

    // Add to notifications array
    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    // Auto-remove after duration (if not persistent)
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    // Show browser notification if permitted
    this.showBrowserNotification(notification);
  }

  // Remove notification by ID
  remove(id: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications.next(updatedNotifications);
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    this.notifications.next(updatedNotifications);
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    this.notifications.next(updatedNotifications);
  }

  // Clear all notifications
  clear(): void {
    this.notifications.next([]);
  }

  // Clear read notifications
  clearRead(): void {
    const currentNotifications = this.notifications.value;
    const unreadNotifications = currentNotifications.filter(n => !n.read);
    this.notifications.next(unreadNotifications);
  }

  // Get unread count
  getUnreadCount(): Observable<number> {
    return new Observable<number>(observer => {
      this.notifications$.subscribe(notifications => {
        const unreadCount = notifications.filter(n => !n.read).length;
        observer.next(unreadCount);
      });
    });
  }

  // Get notifications by type
  getByType(type: 'success' | 'error' | 'warning' | 'info'): Observable<AppNotification[]> {
    return new Observable<AppNotification[]>(observer => {
      this.notifications$.subscribe(notifications => {
        const filteredNotifications = notifications.filter(n => n.type === type);
        observer.next(filteredNotifications);
      });
    });
  }

  // Request browser notification permission
  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Show browser notification
  private showBrowserNotification(notification: AppNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new window.Notification(notification.title, {
        body: notification.message,
        icon: this.getNotificationIcon(notification.type),
        tag: notification.id,
        requireInteraction: notification.persistent
      });

      browserNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        browserNotification.close();
      };

      // Auto-close browser notification
      if (!notification.persistent && notification.duration) {
        setTimeout(() => {
          browserNotification.close();
        }, Math.min(notification.duration, 10000)); // Max 10 seconds for browser notifications
      }
    }
  }

  // Get notification icon based on type
  private getNotificationIcon(type: string): string {
    const iconMap = {
      success: '/assets/icons/success.png',
      error: '/assets/icons/error.png',
      warning: '/assets/icons/warning.png',
      info: '/assets/icons/info.png'
    };
    return iconMap[type as keyof typeof iconMap] || iconMap.info;
  }

  // Generate unique ID
  private generateId(): string {
    return `notification_${this.nextId++}_${Date.now()}`;
  }

  // Predefined notification templates
  showLoginSuccess(username: string): void {
    this.showSuccess(
      'Welcome back!',
      `Successfully logged in as ${username}`,
      3000
    );
  }

  showLogoutSuccess(): void {
    this.showInfo(
      'Logged out',
      'You have been successfully logged out',
      3000
    );
  }

  showOrderPlaced(orderNumber: string): void {
    this.showSuccess(
      'Order Placed!',
      `Your order #${orderNumber} has been placed successfully`,
      5000
    );
  }

  showPaymentError(): void {
    this.showError(
      'Payment Failed',
      'There was an issue processing your payment. Please try again.',
      true
    );
  }

  showNetworkError(): void {
    this.showError(
      'Connection Error',
      'Unable to connect to the server. Please check your internet connection.',
      true
    );
  }

  showFormValidationError(): void {
    this.showWarning(
      'Form Errors',
      'Please correct the highlighted fields and try again',
      5000
    );
  }

  showItemAddedToCart(itemName: string): void {
    this.showSuccess(
      'Added to Cart',
      `${itemName} has been added to your cart`,
      3000
    );
  }

  showItemRemovedFromCart(itemName: string): void {
    this.showInfo(
      'Removed from Cart',
      `${itemName} has been removed from your cart`,
      3000
    );
  }
}