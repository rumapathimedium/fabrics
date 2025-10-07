import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent implements OnInit, OnDestroy {
  // Base64 encoded placeholder image
  private placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U5ZWNlZiIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iIGZpbGw9IiM2Yzc1N2QiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+';

  bannerSlides: BannerSlide[] = [
    {
      id: 1,
      title: 'New Collection 2025',
      subtitle: 'Discover the Latest Fashion Trends',
      description: 'Explore our carefully curated collection featuring the hottest styles and timeless classics.',
      image: this.placeholderImage,
      mobileImage: this.placeholderImage,
      buttonText: 'Shop Collection',
      buttonLink: '/products',
      backgroundColor: '#667eea',
      textColor: '#ffffff',
      isActive: true
    },
    {
      id: 2,
      title: 'Summer Sale',
      subtitle: 'Up to 50% Off Selected Items',
      description: 'Beat the heat with our amazing summer deals. Limited time offer on premium clothing.',
      image: this.placeholderImage,
      mobileImage: this.placeholderImage,
      buttonText: 'Shop Sale',
      buttonLink: '/products?sale=true',
      backgroundColor: '#ff6b6b',
      textColor: '#ffffff',
      isActive: false
    },
    {
      id: 3,
      title: 'Premium Quality',
      subtitle: 'Handcrafted with Care',
      description: 'Experience the finest materials and craftsmanship in every piece we create.',
      image: this.placeholderImage,
      mobileImage: this.placeholderImage,
      buttonText: 'Learn More',
      buttonLink: '/about',
      backgroundColor: '#28a745',
      textColor: '#ffffff',
      isActive: false
    }
  ];

  currentSlideIndex = 0;
  slideInterval: any;
  autoSlideDelay = 5000; // 5 seconds
  isPlaying = true;
  isPaused = false;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.autoSlideDelay);
  }

  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  pauseAutoSlide(): void {
    this.isPaused = true;
  }

  resumeAutoSlide(): void {
    this.isPaused = false;
  }

  toggleAutoSlide(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.resumeAutoSlide();
      this.startAutoSlide();
    } else {
      this.pauseAutoSlide();
      this.stopAutoSlide();
    }
  }

  nextSlide(): void {
    this.setActiveSlide(false);
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.bannerSlides.length;
    this.setActiveSlide(true);
  }

  prevSlide(): void {
    this.setActiveSlide(false);
    this.currentSlideIndex = this.currentSlideIndex === 0 
      ? this.bannerSlides.length - 1 
      : this.currentSlideIndex - 1;
    this.setActiveSlide(true);
  }

  goToSlide(index: number): void {
    if (index !== this.currentSlideIndex) {
      this.setActiveSlide(false);
      this.currentSlideIndex = index;
      this.setActiveSlide(true);
    }
  }

  private setActiveSlide(isActive: boolean): void {
    this.bannerSlides[this.currentSlideIndex].isActive = isActive;
  }

  getCurrentSlide(): BannerSlide {
    return this.bannerSlides[this.currentSlideIndex];
  }

  getSlideProgress(): number {
    return ((this.currentSlideIndex + 1) / this.bannerSlides.length) * 100;
  }

  trackBySlideId(index: number, slide: BannerSlide): number {
    return slide.id;
  }

  onSlideClick(slide: BannerSlide): void {
    // Analytics tracking for banner clicks
    this.trackBannerClick(slide);
  }

  private trackBannerClick(slide: BannerSlide): void {
    // In a real app, you would integrate with your analytics service
    console.log('Banner clicked:', {
      slideId: slide.id,
      title: slide.title,
      buttonLink: slide.buttonLink,
      timestamp: new Date().toISOString()
    });
  }

  // Touch/swipe support for mobile
  private startX = 0;
  private endX = 0;

  onTouchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
    this.pauseAutoSlide();
  }

  onTouchEnd(event: TouchEvent): void {
    this.endX = event.changedTouches[0].clientX;
    this.handleSwipe();
    this.resumeAutoSlide();
  }

  private handleSwipe(): void {
    const threshold = 50; // Minimum swipe distance
    const diff = this.startX - this.endX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left - next slide
        this.nextSlide();
      } else {
        // Swiped right - previous slide
        this.prevSlide();
      }
    }
  }

  // Keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.prevSlide();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextSlide();
        break;
      case ' ':
        event.preventDefault();
        this.toggleAutoSlide();
        break;
      case 'Home':
        event.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        event.preventDefault();
        this.goToSlide(this.bannerSlides.length - 1);
        break;
    }
  }
  
  // Image error handler
  onImageError(event: any): void {
    event.target.src = this.placeholderImage;
  }
}

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  mobileImage: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
}