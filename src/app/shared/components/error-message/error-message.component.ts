import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

export interface ErrorMessage {
  id?: string;
  type: ErrorType;
  title?: string;
  message: string;
  details?: string;
  dismissible?: boolean;
  autoHide?: boolean;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent implements OnInit, OnDestroy {
  @Input() error: ErrorMessage | null = null;
  @Input() errors: ErrorMessage[] = [];
  @Input() showIcon = true;
  @Input() showTitle = true;
  @Input() compact = false;
  @Input() position: 'top' | 'bottom' | 'inline' = 'inline';
  @Input() maxWidth: string = '100%';
  @Input() animation: 'slide' | 'fade' | 'none' = 'fade';

  @Output() errorDismissed = new EventEmitter<ErrorMessage>();
  @Output() actionClicked = new EventEmitter<ErrorMessage>();

  private autoHideTimers = new Map<string, any>();

  ngOnInit(): void {
    this.setupAutoHide();
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
  }

  private setupAutoHide(): void {
    const allErrors = this.getAllErrors();
    allErrors.forEach(error => {
      if (error.autoHide && error.duration && error.id) {
        const timer = setTimeout(() => {
          this.dismissError(error);
        }, error.duration);
        this.autoHideTimers.set(error.id, timer);
      }
    });
  }

  private clearAllTimers(): void {
    this.autoHideTimers.forEach(timer => clearTimeout(timer));
    this.autoHideTimers.clear();
  }

  getAllErrors(): ErrorMessage[] {
    if (this.error) {
      return [this.error];
    }
    return this.errors || [];
  }

  getErrorIcon(type: ErrorType): string {
    const icons = {
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      success: 'fas fa-check-circle'
    };
    return icons[type] || icons.error;
  }

  getErrorClass(type: ErrorType): string {
    return `error-${type}`;
  }

  dismissError(error: ErrorMessage): void {
    if (error.id && this.autoHideTimers.has(error.id)) {
      clearTimeout(this.autoHideTimers.get(error.id));
      this.autoHideTimers.delete(error.id);
    }
    this.errorDismissed.emit(error);
  }

  onActionClick(error: ErrorMessage): void {
    if (error.action) {
      error.action.handler();
      this.actionClicked.emit(error);
    }
  }

  getAnimationType(): string {
    return 'fade-in';
  }

  trackByErrorId(index: number, error: ErrorMessage): string {
    return error.id || `error-${index}`;
  }
}