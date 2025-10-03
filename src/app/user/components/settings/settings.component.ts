import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  securityAlerts: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  dataCollection: boolean;
  personalizedAds: boolean;
}

interface PreferenceSettings {
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: Date;
  activeSessions: number;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  preferenceForm: FormGroup;
  passwordForm: FormGroup;
  
  securitySettings: SecuritySettings | null = null;
  isLoading = false;
  isSaving = false;
  showPasswordForm = false;
  show2FASetup = false;
  
  activeTab: 'notifications' | 'privacy' | 'preferences' | 'security' | 'account' = 'notifications';
  
  languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' }
  ];
  
  currencyOptions = [
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' }
  ];
  
  timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  // Additional properties for template
  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
  ];

  timezones = this.timezoneOptions;

  is2FAEnabled = false;
  memberSince = new Date('2022-01-15');
  lastLogin = new Date();

  recentLogins = [
    {
      device: 'Chrome on Windows',
      deviceType: 'desktop' as const,
      location: 'New York, NY',
      timestamp: new Date(),
      isCurrent: true
    },
    {
      device: 'Safari on iPhone',
      deviceType: 'mobile' as const,
      location: 'San Francisco, CA',
      timestamp: new Date(Date.now() - 86400000),
      isCurrent: false
    },
    {
      device: 'Firefox on macOS',
      deviceType: 'desktop' as const,
      location: 'Austin, TX',
      timestamp: new Date(Date.now() - 172800000),
      isCurrent: false
    },
    {
      device: 'Safari on iPad',
      deviceType: 'tablet' as const,
      location: 'Los Angeles, CA',
      timestamp: new Date(Date.now() - 259200000),
      isCurrent: false
    }
  ];

  // Form aliases for template compatibility
  get preferencesForm() { return this.preferenceForm; }
  get notificationsForm() { return this.notificationForm; }

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.notificationForm = this.createNotificationForm();
    this.privacyForm = this.createPrivacyForm();
    this.preferenceForm = this.createPreferenceForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createNotificationForm(): FormGroup {
    return this.fb.group({
      email: [true],
      sms: [false],
      push: [true],
      orderUpdates: [true],
      promotions: [true],
      newsletter: [false],
      securityAlerts: [true]
    });
  }

  private createPrivacyForm(): FormGroup {
    return this.fb.group({
      profileVisibility: ['private'],
      showEmail: [false],
      showPhone: [false],
      dataCollection: [true],
      personalizedAds: [false]
    });
  }

  private createPreferenceForm(): FormGroup {
    return this.fb.group({
      language: ['en'],
      currency: ['USD'],
      timezone: ['America/New_York'],
      theme: ['light'],
      autoSave: [true]
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private loadSettings(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual service calls
    setTimeout(() => {
      // Load notification settings
      this.notificationForm.patchValue({
        email: true,
        sms: false,
        push: true,
        orderUpdates: true,
        promotions: false,
        newsletter: false,
        securityAlerts: true
      });
      
      // Load privacy settings
      this.privacyForm.patchValue({
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false,
        dataCollection: true,
        personalizedAds: false
      });
      
      // Load preference settings
      this.preferenceForm.patchValue({
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        theme: 'light',
        autoSave: true
      });
      
      // Load security settings
      this.securitySettings = {
        twoFactorEnabled: false,
        lastPasswordChange: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        activeSessions: 3
      };
      
      this.isLoading = false;
    }, 500);
  }

  switchTab(tab: 'notifications' | 'privacy' | 'preferences' | 'security' | 'account'): void {
    this.activeTab = tab;
    this.showPasswordForm = false;
    this.show2FASetup = false;
  }

  // Notification Settings
  saveNotifications(): void {
    this.isSaving = true;
    
    // Mock save - replace with actual service call
    setTimeout(() => {
      console.log('Notification settings saved:', this.notificationForm.value);
      this.isSaving = false;
    }, 1000);
  }

  // Privacy Settings
  savePrivacy(): void {
    this.isSaving = true;
    
    // Mock save - replace with actual service call
    setTimeout(() => {
      console.log('Privacy settings saved:', this.privacyForm.value);
      this.isSaving = false;
    }, 1000);
  }

  // Preference Settings
  savePreferences(): void {
    this.isSaving = true;
    
    // Mock save - replace with actual service call
    setTimeout(() => {
      console.log('Preference settings saved:', this.preferenceForm.value);
      this.isSaving = false;
    }, 1000);
  }

  // Security Settings
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isSaving = true;
      
      // Mock password change - replace with actual service call
      setTimeout(() => {
        console.log('Password changed successfully');
        this.showPasswordForm = false;
        this.passwordForm.reset();
        this.isSaving = false;
        
        // Update last password change date
        if (this.securitySettings) {
          this.securitySettings.lastPasswordChange = new Date();
        }
      }, 1500);
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  toggle2FA(): void {
    if (this.securitySettings?.twoFactorEnabled) {
      // Disable 2FA
      if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        this.isSaving = true;
        
        setTimeout(() => {
          if (this.securitySettings) {
            this.securitySettings.twoFactorEnabled = false;
          }
          this.isSaving = false;
        }, 1000);
      }
    } else {
      // Enable 2FA
      this.show2FASetup = true;
    }
  }

  complete2FASetup(): void {
    this.isSaving = true;
    
    // Mock 2FA setup completion
    setTimeout(() => {
      if (this.securitySettings) {
        this.securitySettings.twoFactorEnabled = true;
      }
      this.show2FASetup = false;
      this.isSaving = false;
    }, 1500);
  }

  cancel2FASetup(): void {
    this.show2FASetup = false;
  }

  viewActiveSessions(): void {
    // Navigate to sessions management or show modal
    console.log('Viewing active sessions');
  }

  logoutAllDevices(): void {
    if (confirm('Are you sure you want to log out from all devices? You will need to sign in again.')) {
      console.log('Logging out from all devices');
      // Implement logout from all devices
    }
  }

  // Account Management
  downloadData(): void {
    console.log('Downloading user data');
    // Implement data download
  }

  deactivateAccount(): void {
    if (confirm('Are you sure you want to deactivate your account? This action can be reversed within 30 days.')) {
      console.log('Deactivating account');
      // Navigate to deactivation process
    }
  }

  deleteAccount(): void {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation === 'DELETE') {
      console.log('Deleting account');
      // Navigate to deletion process
    }
  }

  requestDataExport(): void {
    console.log('Requesting data export');
    // Implement data export functionality
    alert('Data export has been requested. You will receive an email with download instructions.');
  }

  requestAccountDeletion(): void {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmation) {
      this.deleteAccount();
    }
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
      if (field.errors['required']) return `${this.formatFieldName(fieldName)} is required`;
      if (field.errors['minlength']) return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysSincePasswordChange(): number {
    if (!this.securitySettings?.lastPasswordChange) return 0;
    
    const now = new Date();
    const lastChange = new Date(this.securitySettings.lastPasswordChange);
    const diffTime = Math.abs(now.getTime() - lastChange.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  getPasswordStrengthClass(): string {
    const days = this.getDaysSincePasswordChange();
    if (days > 90) return 'strength-weak';
    if (days > 60) return 'strength-medium';
    return 'strength-strong';
  }

  getPasswordStrengthText(): string {
    const days = this.getDaysSincePasswordChange();
    if (days > 90) return 'Consider updating your password';
    if (days > 60) return 'Password is getting old';
    return 'Password is recent';
  }

  get hasUnsavedChanges(): boolean {
    return this.notificationForm.dirty || 
           this.privacyForm.dirty || 
           this.preferenceForm.dirty;
  }
}