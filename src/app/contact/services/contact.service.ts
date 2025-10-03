import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  agreeToTerms: boolean;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  ticketId?: string;
  estimatedResponse?: string;
}

export interface ContactCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

export interface ContactInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly STORAGE_KEY = 'contact_submissions';

  constructor() {}

  // Get contact categories
  getContactCategories(): Observable<ContactCategory[]> {
    const categories: ContactCategory[] = [
      {
        id: 'general',
        name: 'General Inquiry',
        description: 'General questions about our products or services',
        icon: 'fas fa-question-circle'
      },
      {
        id: 'support',
        name: 'Customer Support',
        description: 'Need help with an existing order or account',
        icon: 'fas fa-headset'
      },
      {
        id: 'sales',
        name: 'Sales',
        description: 'Questions about purchasing or bulk orders',
        icon: 'fas fa-shopping-cart'
      },
      {
        id: 'technical',
        name: 'Technical Support',
        description: 'Technical issues with our website or products',
        icon: 'fas fa-tools'
      },
      {
        id: 'billing',
        name: 'Billing & Returns',
        description: 'Billing questions, refunds, and return requests',
        icon: 'fas fa-credit-card'
      },
      {
        id: 'partnership',
        name: 'Business Partnership',
        description: 'Interested in partnering with us',
        icon: 'fas fa-handshake'
      }
    ];

    return of(categories).pipe(delay(300));
  }

  // Submit contact form
  submitContactForm(formData: ContactForm): Observable<ContactSubmissionResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        // Validate form data
        const validation = this.validateContactForm(formData);
        if (!validation.isValid) {
          observer.error({
            success: false,
            message: `Validation failed: ${validation.errors.join(', ')}`
          });
          return;
        }

        // Simulate API call with 95% success rate
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
          const ticketId = this.generateTicketId();
          const estimatedResponse = this.getEstimatedResponseTime(formData.priority);
          
          // Save submission locally (for demo purposes)
          this.saveSubmissionLocally(formData, ticketId);
          
          observer.next({
            success: true,
            message: 'Thank you for contacting us! We\'ve received your message and will get back to you soon.',
            ticketId: ticketId,
            estimatedResponse: estimatedResponse
          });
        } else {
          observer.next({
            success: false,
            message: 'Sorry, there was an error submitting your message. Please try again later.'
          });
        }
        observer.complete();
      }, 1500); // Simulate network delay
    });
  }

  // Get frequently asked questions
  getFAQs(): Observable<FAQ[]> {
    const faqs: FAQ[] = [
      {
        id: 1,
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days within the US. Express shipping options are available for faster delivery.',
        category: 'shipping',
        helpful: 45
      },
      {
        id: 2,
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all items in original condition. Returns are free and easy through our online portal.',
        category: 'returns',
        helpful: 38
      },
      {
        id: 3,
        question: 'Do you offer size exchanges?',
        answer: 'Yes, we offer free size exchanges within 30 days of purchase. Simply contact our support team to initiate an exchange.',
        category: 'exchanges',
        helpful: 29
      },
      {
        id: 4,
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track orders by logging into your account.',
        category: 'shipping',
        helpful: 52
      },
      {
        id: 5,
        question: 'Do you ship internationally?',
        answer: 'Currently, we ship to the US, Canada, and select European countries. International shipping rates vary by location.',
        category: 'shipping',
        helpful: 23
      },
      {
        id: 6,
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and buy-now-pay-later options.',
        category: 'payment',
        helpful: 34
      }
    ];

    return of(faqs).pipe(delay(400));
  }

  // Get contact information
  getContactInfo(): Observable<ContactInfo> {
    const contactInfo: ContactInfo = {
      address: '123 Fashion Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'support@clothstore.com',
      businessHours: {
        monday: '9:00 AM - 8:00 PM',
        tuesday: '9:00 AM - 8:00 PM',
        wednesday: '9:00 AM - 8:00 PM',
        thursday: '9:00 AM - 8:00 PM',
        friday: '9:00 AM - 8:00 PM',
        saturday: '10:00 AM - 6:00 PM',
        sunday: '12:00 PM - 5:00 PM'
      }
    };

    return of(contactInfo).pipe(delay(200));
  }

  // Mark FAQ as helpful
  markFAQHelpful(faqId: number): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  // Search FAQs
  searchFAQs(query: string): Observable<FAQ[]> {
    return this.getFAQs().pipe(
      map(faqs => faqs.filter(faq => 
        faq.question.toLowerCase().includes(query.toLowerCase()) ||
        faq.answer.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  // Private methods
  private validateContactForm(formData: ContactForm): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!formData.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!formData.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.subject?.trim()) {
      errors.push('Subject is required');
    }

    if (!formData.message?.trim()) {
      errors.push('Message is required');
    } else if (formData.message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    if (!formData.category) {
      errors.push('Please select a category');
    }

    if (!formData.agreeToTerms) {
      errors.push('You must agree to the terms and conditions');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateTicketId(): string {
    const prefix = 'CT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private getEstimatedResponseTime(priority: string): string {
    switch (priority) {
      case 'high':
        return 'within 2-4 hours';
      case 'medium':
        return 'within 24 hours';
      case 'low':
      default:
        return 'within 2-3 business days';
    }
  }

  private saveSubmissionLocally(formData: ContactForm, ticketId: string): void {
    try {
      const submission = {
        ...formData,
        ticketId,
        submittedAt: new Date().toISOString()
      };

      const existingSubmissions = this.getStoredSubmissions();
      existingSubmissions.push(submission);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingSubmissions));
    } catch (error) {
      console.warn('Could not save submission to local storage:', error);
    }
  }

  private getStoredSubmissions(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Could not retrieve stored submissions:', error);
      return [];
    }
  }
}