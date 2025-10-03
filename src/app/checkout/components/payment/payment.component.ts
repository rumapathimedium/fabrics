import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService, PaymentMethod } from '../../services/checkout.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod: PaymentMethod | null = null;
  isProcessing = false;
  isLoading = false;
  errorMessage = '';
  
  // Payment method types
  readonly PAYMENT_TYPES = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    PAYPAL: 'paypal',
    APPLE_PAY: 'apple_pay',
    GOOGLE_PAY: 'google_pay'
  };

  constructor(
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private router: Router
  ) {
    this.paymentForm = this.createPaymentForm();
  }

  ngOnInit(): void {
    this.loadPaymentMethods();
    this.subscribeToPaymentUpdates();
  }

  private createPaymentForm(): FormGroup {
    return this.fb.group({
      paymentType: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', Validators.required],
      billingAddress: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
        country: ['US', Validators.required]
      }),
      savePaymentMethod: [false]
    });
  }

  private loadPaymentMethods(): void {
    this.isLoading = true;
    this.checkoutService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
        this.errorMessage = 'Failed to load payment methods';
        this.isLoading = false;
      }
    });
  }

  private subscribeToPaymentUpdates(): void {
    this.checkoutService.currentPaymentMethod$.subscribe(method => {
      this.selectedPaymentMethod = method;
      if (method) {
        this.populateFormWithPaymentMethod(method);
      }
    });
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.checkoutService.selectPaymentMethod(method);
    this.paymentForm.patchValue({ paymentType: method.type });
  }

  selectPaymentType(type: string): void {
    this.paymentForm.patchValue({ paymentType: type });
    this.updateCardValidation(type);
  }

  private updateCardValidation(type: string): void {
    const cardControls = ['cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'cardholderName'];
    const isCardPayment = type === this.PAYMENT_TYPES.CREDIT_CARD || type === this.PAYMENT_TYPES.DEBIT_CARD;
    
    cardControls.forEach(controlName => {
      const control = this.paymentForm.get(controlName);
      if (control) {
        if (isCardPayment) {
          control.enable();
        } else {
          control.disable();
          control.setValue('');
        }
      }
    });
  }

  private populateFormWithPaymentMethod(method: PaymentMethod): void {
    this.paymentForm.patchValue({
      paymentType: method.type,
      cardNumber: method.lastFourDigits ? `****-****-****-${method.lastFourDigits}` : '',
      cardholderName: method.cardholderName || ''
    });
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1-');
    event.target.value = value;
    this.paymentForm.patchValue({ cardNumber: value.replace(/-/g, '') });
  }

  formatExpiryDate(event: any, field: 'month' | 'year'): void {
    const value = event.target.value.replace(/\D/g, '');
    if (field === 'month') {
      const month = Math.min(parseInt(value) || 0, 12);
      this.paymentForm.patchValue({ expiryMonth: month });
    } else {
      this.paymentForm.patchValue({ expiryYear: parseInt(value) || 0 });
    }
  }

  async processPayment(): Promise<void> {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    try {
      const paymentData = this.paymentForm.value;
      const result = await this.checkoutService.processPayment(paymentData).toPromise();
      
      if (result?.success) {
        // Navigate to success page or order confirmation
        this.router.navigate(['/checkout/confirmation']);
      } else {
        this.errorMessage = result?.message || 'Payment processing failed';
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.errorMessage = 'Payment processing failed. Please try again.';
    } finally {
      this.isProcessing = false;
    }
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
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
      if (field.errors['min']) return `${fieldName} value is too low`;
      if (field.errors['max']) return `${fieldName} value is too high`;
    }
    return '';
  }

  getMonthOptions(): number[] {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear + i);
  }

  getCardTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'visa':
        return 'fab fa-cc-visa';
      case 'mastercard':
        return 'fab fa-cc-mastercard';
      case 'amex':
        return 'fab fa-cc-amex';
      case 'discover':
        return 'fab fa-cc-discover';
      case 'paypal':
        return 'fab fa-paypal';
      default:
        return 'fas fa-credit-card';
    }
  }

  goBack(): void {
    this.router.navigate(['/checkout/order-summary']);
  }

  trackByMethodId(index: number, method: PaymentMethod): number {
    return method.id;
  }
}