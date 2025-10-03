import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BannerComponent } from '../banner/banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BannerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  featuredProducts: FeaturedProduct[] = [
    {
      id: 1,
      name: 'Classic White Shirt',
      description: 'Premium cotton blend shirt perfect for any occasion',
      price: 79.99,
      originalPrice: 99.99,
      image: '/assets/images/products/shirt-1.jpg',
      category: 'Shirts',
      rating: 4.8,
      reviewCount: 124,
      isOnSale: true,
      isFeatured: true,
      isNew: false
    },
    {
      id: 2,
      name: 'Designer Jeans',
      description: 'Comfortable slim-fit jeans with premium denim',
      price: 129.99,
      originalPrice: null,
      image: '/assets/images/products/jeans-1.jpg',
      category: 'Jeans',
      rating: 4.6,
      reviewCount: 89,
      isOnSale: false,
      isFeatured: true,
      isNew: true
    },
    {
      id: 3,
      name: 'Summer Dress',
      description: 'Elegant floral print dress for summer occasions',
      price: 89.99,
      originalPrice: 119.99,
      image: '/assets/images/products/dress-1.jpg',
      category: 'Dresses',
      rating: 4.9,
      reviewCount: 156,
      isOnSale: true,
      isFeatured: true,
      isNew: false
    },
    {
      id: 4,
      name: 'Casual Sneakers',
      description: 'Comfortable and stylish sneakers for everyday wear',
      price: 159.99,
      originalPrice: null,
      image: '/assets/images/products/shoes-1.jpg',
      category: 'Shoes',
      rating: 4.7,
      reviewCount: 203,
      isOnSale: false,
      isFeatured: true,
      isNew: true
    }
  ];

  categories: ProductCategory[] = [
    {
      id: 1,
      name: 'Men\'s Fashion',
      description: 'Discover the latest trends in men\'s clothing',
      image: '/assets/images/categories/mens.jpg',
      link: '/products?category=mens',
      productCount: 245
    },
    {
      id: 2,
      name: 'Women\'s Fashion',
      description: 'Elegant and stylish women\'s collection',
      image: '/assets/images/categories/womens.jpg',
      link: '/products?category=womens',
      productCount: 312
    },
    {
      id: 3,
      name: 'Accessories',
      description: 'Complete your look with our accessories',
      image: '/assets/images/categories/accessories.jpg',
      link: '/products?category=accessories',
      productCount: 189
    },
    {
      id: 4,
      name: 'Shoes',
      description: 'Step out in style with our shoe collection',
      image: '/assets/images/categories/shoes.jpg',
      link: '/products?category=shoes',
      productCount: 156
    }
  ];

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: '/assets/images/avatars/sarah.jpg',
      rating: 5,
      comment: 'Amazing quality and fast shipping! I love my new dress and have received so many compliments.',
      product: 'Summer Dress',
      date: new Date('2024-09-15')
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: '/assets/images/avatars/mike.jpg',
      rating: 5,
      comment: 'The shirt fits perfectly and the material is top-notch. Will definitely shop here again!',
      product: 'Classic White Shirt',
      date: new Date('2024-09-10')
    },
    {
      id: 3,
      name: 'Emily Davis',
      avatar: '/assets/images/avatars/emily.jpg',
      rating: 4,
      comment: 'Great customer service and beautiful products. The jeans are exactly what I was looking for.',
      product: 'Designer Jeans',
      date: new Date('2024-09-05')
    }
  ];

  stats: Stat[] = [
    {
      icon: 'fas fa-users',
      value: '50,000+',
      label: 'Happy Customers',
      description: 'Satisfied customers worldwide'
    },
    {
      icon: 'fas fa-shirt',
      value: '1,000+',
      label: 'Products',
      description: 'Carefully curated items'
    },
    {
      icon: 'fas fa-globe',
      value: '25+',
      label: 'Countries',
      description: 'Global shipping coverage'
    },
    {
      icon: 'fas fa-award',
      value: '5',
      label: 'Years',
      description: 'Of fashion excellence'
    }
  ];

  currentTestimonialIndex = 0;
  testimonialInterval: any;

  ngOnInit(): void {
    this.startTestimonialRotation();
  }

  ngOnDestroy(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
  }

  startTestimonialRotation(): void {
    this.testimonialInterval = setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  nextTestimonial(): void {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.currentTestimonialIndex = this.currentTestimonialIndex === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonialIndex - 1;
  }

  goToTestimonial(index: number): void {
    this.currentTestimonialIndex = index;
  }

  getCurrentTestimonial(): Testimonial {
    return this.testimonials[this.currentTestimonialIndex];
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  addToCart(product: FeaturedProduct): void {
    // In a real app, this would integrate with your cart service
    console.log('Added to cart:', product);
    // You might show a toast notification here
  }

  addToWishlist(product: FeaturedProduct): void {
    // In a real app, this would integrate with your wishlist service
    console.log('Added to wishlist:', product);
  }

  trackByProductId(index: number, product: FeaturedProduct): number {
    return product.id;
  }

  trackByCategoryId(index: number, category: ProductCategory): number {
    return category.id;
  }

  trackByTestimonialId(index: number, testimonial: Testimonial): number {
    return testimonial.id;
  }

  trackByStatIndex(index: number, stat: Stat): number {
    return index;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

interface FeaturedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isOnSale: boolean;
  isFeatured: boolean;
  isNew: boolean;
}

interface ProductCategory {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
  productCount: number;
}

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  product: string;
  date: Date;
}

interface Stat {
  icon: string;
  value: string;
  label: string;
  description: string;
}