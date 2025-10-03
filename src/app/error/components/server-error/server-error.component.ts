import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss'
})
export class ServerErrorComponent implements OnInit {
  errorCode: number = 500;
  errorMessage: string = 'Internal Server Error';
  errorDetails: any = null;
  showDetails: boolean = false;
  showReportForm: boolean = false;
  reportForm: FormGroup;
  isSubmittingReport: boolean = false;
  reportSubmitted: boolean = false;

  errorTypes = {
    500: {
      title: 'Internal Server Error',
      message: 'Something went wrong on our end. Our team has been notified.',
      icon: 'fas fa-server'
    },
    502: {
      title: 'Bad Gateway',
      message: 'The server is temporarily unavailable. Please try again later.',
      icon: 'fas fa-exclamation-triangle'
    },
    503: {
      title: 'Service Unavailable',
      message: 'The service is temporarily down for maintenance.',
      icon: 'fas fa-tools'
    },
    504: {
      title: 'Gateway Timeout',
      message: 'The server took too long to respond. Please try again.',
      icon: 'fas fa-clock'
    }
  };

  retryAttempts: number = 0;
  maxRetryAttempts: number = 3;
  retryInProgress: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.reportForm = this.createReportForm();
  }

  ngOnInit(): void {
    // Get error details from route data or query params
    this.route.queryParams.subscribe(params => {
      this.errorCode = params['code'] ? parseInt(params['code']) : 500;
      this.errorMessage = params['message'] || this.getDefaultMessage();
      
      if (params['details']) {
        try {
          this.errorDetails = JSON.parse(decodeURIComponent(params['details']));
        } catch (e) {
          this.errorDetails = params['details'];
        }
      }
    });

    // Log error for analytics
    this.logError();
  }

  private createReportForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      stepsToReproduce: [''],
      expectedBehavior: [''],
      actualBehavior: [''],
      browserInfo: [this.getBrowserInfo()],
      includeDetails: [true]
    });
  }

  getDefaultMessage(): string {
    const errorType = this.errorTypes[this.errorCode as keyof typeof this.errorTypes];
    return errorType ? errorType.message : 'An unexpected error occurred.';
  }

  getErrorTitle(): string {
    const errorType = this.errorTypes[this.errorCode as keyof typeof this.errorTypes];
    return errorType ? errorType.title : 'Server Error';
  }

  getErrorIcon(): string {
    const errorType = this.errorTypes[this.errorCode as keyof typeof this.errorTypes];
    return errorType ? errorType.icon : 'fas fa-exclamation-circle';
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  toggleReportForm(): void {
    this.showReportForm = !this.showReportForm;
    if (this.showReportForm) {
      this.reportForm.patchValue({
        browserInfo: this.getBrowserInfo()
      });
    }
  }

  async retryRequest(): Promise<void> {
    if (this.retryAttempts >= this.maxRetryAttempts) {
      return;
    }

    this.retryInProgress = true;
    this.retryAttempts++;

    try {
      // Simulate retry delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would retry the original request here
      // For now, we'll just refresh the page or navigate back
      window.location.reload();
    } catch (error) {
      console.error('Retry failed:', error);
      this.retryInProgress = false;
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }

  refreshPage(): void {
    window.location.reload();
  }

  async submitReport(): Promise<void> {
    if (this.reportForm.invalid) {
      this.markFormGroupTouched(this.reportForm);
      return;
    }

    this.isSubmittingReport = true;

    try {
      const reportData = {
        ...this.reportForm.value,
        errorCode: this.errorCode,
        errorMessage: this.errorMessage,
        errorDetails: this.reportForm.value.includeDetails ? this.errorDetails : null,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // In a real app, you would send this to your error reporting service
      console.log('Error report:', reportData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.reportSubmitted = true;
      this.showReportForm = false;
      
      // Reset form
      this.reportForm.reset();
      this.reportForm.patchValue({ includeDetails: true });
      
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      this.isSubmittingReport = false;
    }
  }

  private logError(): void {
    // Log error for analytics/monitoring
    const errorLog = {
      code: this.errorCode,
      message: this.errorMessage,
      details: this.errorDetails,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    console.error('Server Error:', errorLog);
    
    // In a real app, you would send this to your analytics/monitoring service
    // Example: this.analyticsService.trackError(errorLog);
  }

  private getBrowserInfo(): string {
    const nav = navigator;
    return `${nav.userAgent}\nLanguage: ${nav.language}\nPlatform: ${nav.platform}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reportForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.reportForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  canRetry(): boolean {
    return this.retryAttempts < this.maxRetryAttempts && !this.retryInProgress;
  }

  getRetryText(): string {
    if (this.retryInProgress) return 'Retrying...';
    if (this.retryAttempts >= this.maxRetryAttempts) return 'Max retries reached';
    return `Retry (${this.retryAttempts}/${this.maxRetryAttempts})`;
  }
}