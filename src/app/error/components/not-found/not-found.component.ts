import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit {
  currentUrl: string = '';
  previousUrl: string = '';
  suggestedPages: SuggestedPage[] = [
    { name: 'Home', url: '/', icon: 'fas fa-home' },
    { name: 'Shop', url: '/products', icon: 'fas fa-shopping-bag' },
    { name: 'About', url: '/about', icon: 'fas fa-info-circle' },
    { name: 'Contact', url: '/contact', icon: 'fas fa-envelope' }
  ];

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.previousUrl = document.referrer || '';
  }

  goBack(): void {
    if (this.previousUrl && this.previousUrl.includes(window.location.origin)) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  reportIssue(): void {
    const subject = encodeURIComponent(`404 Error Report - Page Not Found`);
    const body = encodeURIComponent(
      `I found a broken link or missing page:\n\n` +
      `URL: ${this.currentUrl}\n` +
      `Previous Page: ${this.previousUrl}\n` +
      `Date: ${new Date().toISOString()}\n\n` +
      `Additional details:\n`
    );
    
    const emailLink = `mailto:support@clothstore.com?subject=${subject}&body=${body}`;
    window.open(emailLink, '_blank');
  }

  searchSite(): void {
    const searchTerm = this.extractSearchTermFromUrl();
    if (searchTerm) {
      this.router.navigate(['/search'], { queryParams: { q: searchTerm } });
    } else {
      this.router.navigate(['/search']);
    }
  }

  private extractSearchTermFromUrl(): string {
    // Try to extract meaningful search terms from the URL
    const path = this.currentUrl.split('?')[0];
    const segments = path.split('/').filter(segment => segment.length > 0);
    
    if (segments.length > 0) {
      return segments[segments.length - 1].replace(/-/g, ' ');
    }
    
    return '';
  }

  trackBySuggestedPage(index: number, page: SuggestedPage): string {
    return page.url;
  }
}

interface SuggestedPage {
  name: string;
  url: string;
  icon: string;
}