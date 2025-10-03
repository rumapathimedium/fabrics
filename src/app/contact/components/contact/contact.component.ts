import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService, ContactForm, ContactCategory, FAQ, ContactInfo, ContactSubmissionResponse } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  categories: ContactCategory[] = [];
  faqs: FAQ[] = [];
  contactInfo: ContactInfo | null = null;
  
  // State management
  isSubmitting = false;
  isLoading = false;
  showFAQs = false;
  searchQuery = '';
  filteredFAQs: FAQ[] = [];
  
  // Form submission result
  submissionResult: ContactSubmissionResponse | null = null;
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private createContactForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      category: ['', Validators.required],
      priority: ['medium', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Load categories
    this.contactService.getContactCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    // Load FAQs
    this.contactService.getFAQs().subscribe({
      next: (faqs) => {
        this.faqs = faqs;
        this.filteredFAQs = faqs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
        this.isLoading = false;
      }
    });

    // Load contact information
    this.contactService.getContactInfo().subscribe({
      next: (info) => {
        this.contactInfo = info;
      },
      error: (error) => {
        console.error('Error loading contact info:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      return;
    }

    this.isSubmitting = true;
    this.showErrorMessage = false;
    this.showSuccessMessage = false;

    const formData: ContactForm = this.contactForm.value;

    this.contactService.submitContactForm(formData).subscribe({
      next: (result) => {
        this.submissionResult = result;
        if (result.success) {
          this.showSuccessMessage = true;
          this.contactForm.reset();
          this.contactForm.patchValue({ priority: 'medium' });
        } else {
          this.showErrorMessage = true;
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.showErrorMessage = true;
        this.submissionResult = {
          success: false,
          message: 'An error occurred while submitting your message. Please try again.'
        };
        this.isSubmitting = false;
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.contactForm.patchValue({ category: categoryId });
  }

  toggleFAQs(): void {
    this.showFAQs = !this.showFAQs;
  }

  searchFAQs(): void {
    if (this.searchQuery.trim()) {
      this.contactService.searchFAQs(this.searchQuery).subscribe({
        next: (results) => {
          this.filteredFAQs = results;
        },
        error: (error) => {
          console.error('Error searching FAQs:', error);
        }
      });
    } else {
      this.filteredFAQs = this.faqs;
    }
  }

  markFAQHelpful(faqId: number): void {
    this.contactService.markFAQHelpful(faqId).subscribe({
      next: () => {
        const faq = this.faqs.find(f => f.id === faqId);
        if (faq) {
          faq.helpful++;
        }
      },
      error: (error) => {
        console.error('Error marking FAQ as helpful:', error);
      }
    });
  }

  dismissSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.submissionResult = null;
  }

  dismissErrorMessage(): void {
    this.showErrorMessage = false;
    this.submissionResult = null;
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} format is invalid`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone number',
      subject: 'Subject',
      message: 'Message',
      category: 'Category',
      priority: 'Priority'
    };
    return labels[fieldName] || fieldName;
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

  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.icon || 'fas fa-question-circle';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  getCharacterCount(): number {
    const message = this.contactForm.get('message')?.value || '';
    return message.length;
  }

  getCharacterCountClass(): string {
    const count = this.getCharacterCount();
    const maxLength = 1000;
    const percentage = (count / maxLength) * 100;
    
    if (percentage > 90) return 'danger';
    if (percentage > 75) return 'warning';
    return 'normal';
  }

  trackByCategoryId(index: number, category: ContactCategory): string {
    return category.id;
  }

  trackByFAQId(index: number, faq: FAQ): number {
    return faq.id;
  }
}