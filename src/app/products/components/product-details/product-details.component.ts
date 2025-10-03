import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  sizes: ProductSize[];
  colors: ProductColor[];
  tags: string[];
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  specifications: { [key: string]: string };
  materials: string[];
  careInstructions: string[];
  shippingInfo: ShippingInfo;
  returnPolicy: string;
  createdAt: Date;
}

interface ProductSize {
  size: string;
  available: boolean;
  stockCount: number;
}

interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
  images: string[];
}

interface ShippingInfo {
  standard: { price: number; days: string };
  express: { price: number; days: string };
  overnight: { price: number; days: string };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: Date;
  images?: string[];
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Product data
  product: Product | null = null;
  relatedProducts: Product[] = [];
  reviews: Review[] = [];
  isLoading = true;
  notFound = false;
  
  // Image gallery
  selectedImageIndex = 0;
  showImageModal = false;
  
  // Product selection
  selectedSize: string = '';
  selectedColor: string = '';
  quantity = 1;
  
  // Reviews
  showAllReviews = false;
  reviewsToShow = 3;
  
  // Tabs
  activeTab: 'description' | 'specifications' | 'reviews' | 'shipping' = 'description';
  
  // Wishlist and cart
  isInWishlist = false;
  isAddingToCart = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const productId = params['id'];
        return this.loadProduct(productId);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(productId: string): Promise<void> {
    this.isLoading = true;
    this.notFound = false;
    
    return new Promise((resolve) => {
      // Mock API call - replace with actual service
      setTimeout(() => {
        const mockProduct = this.generateMockProduct(productId);
        
        if (mockProduct) {
          this.product = mockProduct;
          this.loadRelatedProducts();
          this.loadReviews();
          this.checkWishlistStatus();
        } else {
          this.notFound = true;
        }
        
        this.isLoading = false;
        resolve();
      }, 1000);
    });
  }

  private generateMockProduct(id: string): Product | null {
    // Return null for demo of 404 case
    if (id === 'not-found') {
      return null;
    }

    const categories = ['T-Shirts', 'Jeans', 'Dresses', 'Sweaters', 'Shoes', 'Accessories'];
    const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const price = Math.floor(Math.random() * 200) + 20;
    const originalPrice = Math.random() > 0.7 ? price + Math.floor(Math.random() * 50) : undefined;

    return {
      id,
      name: `Premium ${category.slice(0, -1)}`,
      description: `High-quality ${category.toLowerCase()} perfect for any occasion.`,
      longDescription: `This premium ${category.toLowerCase()} combines style, comfort, and durability in one exceptional piece. Crafted from the finest materials and designed with attention to detail, it's perfect for both casual and formal occasions. The versatile design makes it a must-have addition to your wardrobe.`,
      price,
      originalPrice,
      imageUrl: `https://picsum.photos/600/800?random=${id}`,
      images: [
        `https://picsum.photos/600/800?random=${id}`,
        `https://picsum.photos/600/800?random=${id}1`,
        `https://picsum.photos/600/800?random=${id}2`,
        `https://picsum.photos/600/800?random=${id}3`,
        `https://picsum.photos/600/800?random=${id}4`
      ],
      category,
      brand,
      rating: Math.floor(Math.random() * 2) + 3 + Math.random(),
      reviewCount: Math.floor(Math.random() * 200) + 5,
      sizes: this.generateSizes(),
      colors: this.generateColors(),
      tags: ['comfortable', 'stylish', 'premium', 'versatile'],
      inStock: true,
      stockCount: Math.floor(Math.random() * 50) + 5,
      isNew: Math.random() > 0.8,
      isSale: !!originalPrice,
      isFeatured: Math.random() > 0.9,
      specifications: {
        'Material': '100% Premium Cotton',
        'Fit': 'Regular Fit',
        'Origin': 'Made in USA',
        'Care': 'Machine Washable',
        'Season': 'All Season'
      },
      materials: ['100% Premium Cotton', 'Reinforced Stitching', 'Fade-Resistant Dyes'],
      careInstructions: [
        'Machine wash cold with like colors',
        'Tumble dry low heat',
        'Iron on medium heat if needed',
        'Do not bleach',
        'Do not dry clean'
      ],
      shippingInfo: {
        standard: { price: 5.99, days: '5-7 business days' },
        express: { price: 12.99, days: '2-3 business days' },
        overnight: { price: 24.99, days: '1 business day' }
      },
      returnPolicy: '30-day return policy. Items must be in original condition with tags attached.',
      createdAt: new Date()
    };
  }

  private generateSizes(): ProductSize[] {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    return sizes.map(size => ({
      size,
      available: Math.random() > 0.2,
      stockCount: Math.floor(Math.random() * 10) + 1
    }));
  }

  private generateColors(): ProductColor[] {
    const colors = [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Navy', hex: '#1a365d' },
      { name: 'Gray', hex: '#718096' },
      { name: 'Red', hex: '#e53e3e' }
    ];

    return colors.slice(0, Math.floor(Math.random() * 3) + 2).map(color => ({
      ...color,
      available: Math.random() > 0.3,
      images: [
        `https://picsum.photos/600/800?random=${color.name}1`,
        `https://picsum.photos/600/800?random=${color.name}2`
      ]
    }));
  }

  private loadRelatedProducts(): void {
    // Mock related products
    this.relatedProducts = Array.from({ length: 4 }, (_, i) => 
      this.generateMockProduct(`related-${i}`)!
    );
  }

  private loadReviews(): void {
    // Mock reviews
    this.reviews = Array.from({ length: 8 }, (_, i) => ({
      id: `review-${i}`,
      userId: `user-${i}`,
      userName: `Customer ${i + 1}`,
      userAvatar: `https://i.pravatar.cc/40?img=${i + 1}`,
      rating: Math.floor(Math.random() * 2) + 4,
      title: `Great product!`,
      comment: `This is an excellent product. I'm very satisfied with the quality and fit. Would definitely recommend to others.`,
      helpful: Math.floor(Math.random() * 20),
      verified: Math.random() > 0.3,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      images: Math.random() > 0.7 ? [`https://picsum.photos/200/200?random=review${i}`] : undefined
    }));
  }

  private checkWishlistStatus(): void {
    // Mock wishlist check
    this.isInWishlist = Math.random() > 0.5;
  }

  onImageSelect(index: number): void {
    this.selectedImageIndex = index;
  }

  onImageModalToggle(): void {
    this.showImageModal = !this.showImageModal;
  }

  onColorSelect(color: string): void {
    this.selectedColor = color;
    // Update images based on color selection
    const colorData = this.product?.colors.find(c => c.name === color);
    if (colorData && colorData.images.length > 0) {
      // In a real app, you'd update the product images
      this.selectedImageIndex = 0;
    }
  }

  onSizeSelect(size: string): void {
    this.selectedSize = size;
  }

  onQuantityChange(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= (this.product?.stockCount || 1)) {
      this.quantity = newQuantity;
    }
  }

  onTabChange(tab: string): void {
    if (['description', 'specifications', 'reviews', 'shipping'].includes(tab)) {
      this.activeTab = tab as 'description' | 'specifications' | 'reviews' | 'shipping';
    }
  }

  async onAddToCart(): Promise<void> {
    if (!this.product || !this.selectedSize || !this.selectedColor) {
      return;
    }

    this.isAddingToCart = true;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or redirect
      console.log('Added to cart:', {
        productId: this.product.id,
        size: this.selectedSize,
        color: this.selectedColor,
        quantity: this.quantity
      });
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      this.isAddingToCart = false;
    }
  }

  async onToggleWishlist(): Promise<void> {
    if (!this.product) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isInWishlist = !this.isInWishlist;
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  }

  onBuyNow(): void {
    // Add to cart and redirect to checkout
    this.onAddToCart().then(() => {
      this.router.navigate(['/checkout']);
    });
  }

  onShowMoreReviews(): void {
    this.showAllReviews = true;
  }

  onReviewHelpful(reviewId: string): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful++;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  getDisplayedReviews(): Review[] {
    return this.showAllReviews ? this.reviews : this.reviews.slice(0, this.reviewsToShow);
  }

  get canAddToCart(): boolean {
    return !!(
      this.product?.inStock &&
      this.selectedSize &&
      this.selectedColor &&
      this.quantity > 0 &&
      !this.isAddingToCart
    );
  }

  get selectedSizeData(): ProductSize | undefined {
    return this.product?.sizes?.find(s => s.size === this.selectedSize);
  }

  get selectedColorData(): ProductColor | undefined {
    return this.product?.colors?.find(c => c.name === this.selectedColor);
  }

  get hasColors(): boolean {
    return !!(this.product?.colors && this.product.colors.length > 0);
  }

  get hasSizes(): boolean {
    return !!(this.product?.sizes && this.product.sizes.length > 0);
  }

  get maxQuantity(): number {
    const sizeStock = this.selectedSizeData?.stockCount || 0;
    const totalStock = this.product?.stockCount || 0;
    return Math.min(sizeStock, totalStock, 10); // Max 10 per order
  }

  get discountPercentage(): number {
    if (!this.product?.originalPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }
}