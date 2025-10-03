import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckoutService, Address } from '../../services/checkout.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressComponent implements OnInit {
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  isAddingNew = false;
  isLoading = false;
  addressForm: FormGroup;

  constructor(
    private checkoutService: CheckoutService,
    private fb: FormBuilder
  ) {
    this.addressForm = this.createAddressForm();
  }

  ngOnInit(): void {
    this.loadAddresses();
    this.subscribeToCurrentAddress();
  }

  private createAddressForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      company: [''],
      streetAddress: ['', [Validators.required, Validators.minLength(5)]],
      apartment: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['United States', Validators.required],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      type: ['shipping', Validators.required],
      isDefault: [false]
    });
  }

  private loadAddresses(): void {
    this.isLoading = true;
    this.checkoutService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.isLoading = false;
      }
    });
  }

  private subscribeToCurrentAddress(): void {
    this.checkoutService.currentAddress$.subscribe(address => {
      this.selectedAddress = address;
    });
  }

  selectAddress(address: Address): void {
    this.checkoutService.selectAddress(address);
  }

  startAddingNew(): void {
    this.isAddingNew = true;
    this.addressForm.reset({
      country: 'United States',
      type: 'shipping',
      isDefault: false
    });
  }

  cancelAddingNew(): void {
    this.isAddingNew = false;
    this.addressForm.reset();
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      this.isLoading = true;
      const addressData = this.addressForm.value;
      
      this.checkoutService.saveAddress(addressData).subscribe({
        next: (newAddress) => {
          this.addresses.push(newAddress);
          this.isAddingNew = false;
          this.addressForm.reset();
          this.isLoading = false;
          
          // Auto-select the new address if it's marked as default
          if (newAddress.isDefault) {
            this.selectAddress(newAddress);
          }
        },
        error: (error) => {
          console.error('Error saving address:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.markAsTouched();
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.addressForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} is too short`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'zipCode') {
        return 'Please enter a valid ZIP code';
      }
      if (fieldName === 'phone') {
        return 'Please enter a valid phone number';
      }
    }
    return 'Invalid input';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      company: 'Company',
      streetAddress: 'Street address',
      apartment: 'Apartment',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP code',
      country: 'Country',
      phone: 'Phone number'
    };
    return displayNames[fieldName] || fieldName;
  }

  formatAddress(address: Address): string {
    let formatted = `${address.streetAddress}`;
    if (address.apartment) {
      formatted += `, ${address.apartment}`;
    }
    formatted += `\n${address.city}, ${address.state} ${address.zipCode}`;
    if (address.country !== 'United States') {
      formatted += `\n${address.country}`;
    }
    return formatted;
  }

  trackByAddressId(index: number, address: Address): number {
    return address.id;
  }
}