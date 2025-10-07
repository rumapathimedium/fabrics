import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BannerComponent } from '../banner/banner.component';
import { ImageService } from '../../../shared/services/image.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BannerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  constructor(public imageService: ImageService) {}

  featuredProducts: FeaturedProduct[] = [
    {
      id: 1,
      name: 'Classic White Shirt',
      description: 'Premium cotton blend shirt perfect for any occasion',
      price: 79.99,
      originalPrice: 99.99,
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22shirtGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23e3f2fd%3Bstop-opacity%3A1%22%20/%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23bbdefb%3Bstop-opacity%3A1%22%20/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22url(%23shirtGrad)%22/%3E%3Crect%20x%3D%22100%22%20y%3D%2250%22%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%231976d2%22%20rx%3D%2210%22/%3E%3Crect%20x%3D%22120%22%20y%3D%2270%22%20width%3D%22160%22%20height%3D%2280%22%20fill%3D%22%23ffffff%22%20rx%3D%225%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22115%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%231976d2%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22bold%22%3EShirt%3C/text%3E%3C/svg%3E',
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
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22jeansGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23e8f5e8%3Bstop-opacity%3A1%22%20/%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23c8e6c9%3Bstop-opacity%3A1%22%20/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22url(%23jeansGrad)%22/%3E%3Crect%20x%3D%22120%22%20y%3D%2230%22%20width%3D%22160%22%20height%3D%22240%22%20fill%3D%22%231565c0%22%20rx%3D%2215%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22bold%22%3EJeans%3C/text%3E%3C/svg%3E',
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
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22dressGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23fce4ec%3Bstop-opacity%3A1%22%20/%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23f8bbd9%3Bstop-opacity%3A1%22%20/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22url(%23dressGrad)%22/%3E%3Cpath%20d%3D%22M%20150%2050%20Q%20200%2030%20250%2050%20L%20280%20250%20Q%20200%20270%20120%20250%20Z%22%20fill%3D%22%23e91e63%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22bold%22%3EDress%3C/text%3E%3C/svg%3E',
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
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22shoesGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23fff3e0%3Bstop-opacity%3A1%22%20/%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23ffcc02%3Bstop-opacity%3A1%22%20/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22url(%23shoesGrad)%22/%3E%3Cellipse%20cx%3D%22200%22%20cy%3D%22150%22%20rx%3D%22100%22%20ry%3D%2230%22%20fill%3D%22%23424242%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22100%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23424242%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22bold%22%3EShoes%3C/text%3E%3C/svg%3E',
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
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23263238%22/%3E%3Crect%20x%3D%2250%22%20y%3D%2250%22%20width%3D%22120%22%20height%3D%22150%22%20fill%3D%22%231565c0%22%20rx%3D%2210%22/%3E%3Crect%20x%3D%22230%22%20y%3D%2280%22%20width%3D%22120%22%20height%3D%22180%22%20fill%3D%22%23424242%22%20rx%3D%2215%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%2240%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EMen%27s%20Fashion%3C/text%3E%3C/svg%3E',
      link: '/products?category=mens',
      productCount: 245
    },
    {
      id: 2,
      name: 'Women\'s Fashion',
      description: 'Elegant and stylish women\'s collection',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f8bbd9%22/%3E%3Cpath%20d%3D%22M%20120%2060%20Q%20200%2040%20280%2060%20L%20320%20240%20Q%20200%20260%2080%20240%20Z%22%20fill%3D%22%23e91e63%22/%3E%3Crect%20x%3D%2250%22%20y%3D%2280%22%20width%3D%2280%22%20height%3D%22120%22%20fill%3D%22%239c27b0%22%20rx%3D%228%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%2230%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%234a148c%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EWomen%27s%20Fashion%3C/text%3E%3C/svg%3E',
      link: '/products?category=womens',
      productCount: 312
    },
    {
      id: 3,
      name: 'Accessories',
      description: 'Complete your look with our accessories',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fff8e1%22/%3E%3Ccircle%20cx%3D%22120%22%20cy%3D%22120%22%20r%3D%2240%22%20fill%3D%22%23ff9800%22%20stroke%3D%22%23f57c00%22%20stroke-width%3D%223%22/%3E%3Crect%20x%3D%22200%22%20y%3D%22160%22%20width%3D%22140%22%20height%3D%2280%22%20fill%3D%22%23795548%22%20rx%3D%2210%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%2250%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23bf360c%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EAccessories%3C/text%3E%3C/svg%3E',
      link: '/products?category=accessories',
      productCount: 189
    },
    {
      id: 4,
      name: 'Shoes',
      description: 'Step out in style with our shoe collection',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e3f2fd%22/%3E%3Cellipse%20cx%3D%22130%22%20cy%3D%22150%22%20rx%3D%2280%22%20ry%3D%2230%22%20fill%3D%22%231976d2%22/%3E%3Cellipse%20cx%3D%22270%22%20cy%3D%22180%22%20rx%3D%2290%22%20ry%3D%2235%22%20fill%3D%22%23d32f2f%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%2250%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%231565c0%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EShoes%20Collection%3C/text%3E%3C/svg%3E',
      link: '/products?category=shoes',
      productCount: 156
    }
  ];

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: '',
      rating: 5,
      comment: 'Amazing quality and fast shipping! I love my new dress and have received so many compliments.',
      product: 'Summer Dress',
      date: new Date('2024-09-15')
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: '',
      rating: 5,
      comment: 'The shirt fits perfectly and the material is top-notch. Will definitely shop here again!',
      product: 'Classic White Shirt',
      date: new Date('2024-09-10')
    },
    {
      id: 3,
      name: 'Emily Davis',
      avatar: '',
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
    console.log('HomeComponent initialized');
    console.log('Featured products:', this.featuredProducts.length);
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
  
  // Image error handler
  onImageError(event: any): void {
    console.log('Image error occurred, falling back to placeholder');
    this.imageService.onImageError(event);
  }
  
  // Image load success handler
  onImageLoad(event: any): void {
    this.imageService.onImageLoad(event);
  }
  
  // Helper method to get fallback image
  getFallbackImage(): string {
    return this.imageService.getPlaceholderImage();
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