import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatar: string;
}

interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profileForm: FormGroup;
  addressForm: FormGroup;
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  
  isEditingProfile = false;
  isEditingAddress = false;
  isAddingAddress = false;
  isLoading = false;
  isSaving = false;
  
  activeTab: 'profile' | 'addresses' = 'profile';
  
  countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' }
  ];
  
  addressTypes = [
    { value: 'home', label: 'Home' },
    { value: 'work', label: 'Work' },
    { value: 'other', label: 'Other' }
  ];

  constructor(private fb: FormBuilder) {
    this.profileForm = this.createProfileForm();
    this.addressForm = this.createAddressForm();
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      dateOfBirth: [''],
      avatar: ['']
    });
  }

  private createAddressForm(): FormGroup {
    return this.fb.group({
      type: ['home', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      company: [''],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['US', Validators.required],
      isDefault: [false]
    });
  }

  private loadProfile(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      const mockProfile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '1990-01-15',
        avatar: 'https://i.pravatar.cc/150?img=1'
      };
      
      this.profileForm.patchValue(mockProfile);
      this.isLoading = false;
    }, 500);
  }

  private loadAddresses(): void {
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.addresses = [
        {
          id: '1',
          type: 'home',
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          isDefault: true
        },
        {
          id: '2',
          type: 'work',
          firstName: 'John',
          lastName: 'Doe',
          company: 'Tech Corp',
          addressLine1: '456 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'US',
          isDefault: false
        }
      ];
    }, 300);
  }

  // Profile Methods
  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
      this.loadProfile(); // Reset form if canceling
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      
      // Mock save - replace with actual service call
      setTimeout(() => {
        console.log('Profile saved:', this.profileForm.value);
        this.isEditingProfile = false;
        this.isSaving = false;
      }, 1000);
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileForm.patchValue({ avatar: e.target?.result as string });
      };
      reader.readAsDataURL(file);
      
      // In real app, upload to server
      console.log('Uploading avatar:', file);
    }
  }

  // Address Methods
  addAddress(): void {
    this.isAddingAddress = true;
    this.isEditingAddress = false;
    this.selectedAddress = null;
    this.addressForm.reset({ type: 'home', country: 'US', isDefault: false });
  }

  editAddress(address: Address): void {
    this.isEditingAddress = true;
    this.isAddingAddress = false;
    this.selectedAddress = address;
    this.addressForm.patchValue(address);
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      this.isSaving = true;
      
      const addressData = this.addressForm.value;
      
      // Mock save - replace with actual service call
      setTimeout(() => {
        if (this.isAddingAddress) {
          // Add new address
          const newAddress: Address = {
            ...addressData,
            id: Date.now().toString()
          };
          this.addresses.push(newAddress);
          
          // If this is the first address or marked as default, make it default
          if (addressData.isDefault || this.addresses.length === 1) {
            this.setDefaultAddress(newAddress.id!);
          }
        } else if (this.selectedAddress) {
          // Update existing address
          const index = this.addresses.findIndex(a => a.id === this.selectedAddress!.id);
          if (index !== -1) {
            this.addresses[index] = { ...addressData, id: this.selectedAddress.id };
            
            if (addressData.isDefault && this.selectedAddress.id) {
              this.setDefaultAddress(this.selectedAddress.id);
            }
          }
        }
        
        this.cancelAddressEdit();
        this.isSaving = false;
      }, 1000);
    } else {
      this.markFormGroupTouched(this.addressForm);
    }
  }

  cancelAddressEdit(): void {
    this.isAddingAddress = false;
    this.isEditingAddress = false;
    this.selectedAddress = null;
    this.addressForm.reset();
  }

  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      // Mock delete - replace with actual service call
      setTimeout(() => {
        const index = this.addresses.findIndex(a => a.id === addressId);
        if (index !== -1) {
          const wasDefault = this.addresses[index].isDefault;
          this.addresses.splice(index, 1);
          
          // If deleted address was default, make first address default
          if (wasDefault && this.addresses.length > 0) {
            this.addresses[0].isDefault = true;
          }
        }
      }, 300);
    }
  }

  setDefaultAddress(addressId: string): void {
    // Remove default from all addresses
    this.addresses.forEach(address => {
      address.isDefault = address.id === addressId;
    });
    
    // Mock API call to update default address
    console.log('Setting default address:', addressId);
  }

  // Utility Methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  switchTab(tab: 'profile' | 'addresses'): void {
    this.activeTab = tab;
    
    // Cancel any ongoing edits when switching tabs
    if (tab === 'profile') {
      this.cancelAddressEdit();
    } else {
      this.isEditingProfile = false;
    }
  }

  get hasAddresses(): boolean {
    return this.addresses.length > 0;
  }

  get defaultAddress(): Address | undefined {
    return this.addresses.find(address => address.isDefault);
  }

  getAddressTypeLabel(type: string): string {
    const typeObj = this.addressTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getCountryName(countryCode: string): string {
    const country = this.countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  }

  formatAddress(address: Address): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zipCode}`,
      this.getCountryName(address.country)
    ].filter(Boolean);
    
    return parts.join(', ');
  }
}