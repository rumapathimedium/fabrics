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
  
  // Base64 encoded placeholder image
  private placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U5ZWNlZiIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iIGZpbGw9IiM2Yzc1N2QiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+';
  
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
    // Simplified approach
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProductSync(productId);
      }
    });
  }

  private loadProductSync(productId: string): void {
    this.isLoading = true;
    this.notFound = false;
    
    try {
      const mockProduct = this.generateMockProduct(productId);
      
      if (mockProduct) {
        this.product = mockProduct;
        this.loadRelatedProducts();
        this.loadReviews();
        this.checkWishlistStatus();
        this.isLoading = false;
      } else {
        this.notFound = true;
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error generating product:', error);
      this.notFound = true;
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    // Map categories to actual image paths using data URIs
    const categoryMap: {[key: string]: string} = {
      'T-Shirts': 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e3f2fd%22/%3E%3Crect%20x%3D%22100%22%20y%3D%2250%22%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%231976d2%22%20rx%3D%2210%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EShirt%3C/text%3E%3C/svg%3E',
      'Jeans': 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e8f5e8%22/%3E%3Crect%20x%3D%22120%22%20y%3D%2230%22%20width%3D%22160%22%20height%3D%22240%22%20fill%3D%22%231565c0%22%20rx%3D%2215%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EJeans%3C/text%3E%3C/svg%3E',
      'Dresses': 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fce4ec%22/%3E%3Cpath%20d%3D%22M%20150%2050%20Q%20200%2030%20250%2050%20L%20280%20250%20Q%20200%20270%20120%20250%20Z%22%20fill%3D%22%23e91e63%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EDress%3C/text%3E%3C/svg%3E',
      'Sweaters': 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e3f2fd%22/%3E%3Crect%20x%3D%22100%22%20y%3D%2250%22%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%231976d2%22%20rx%3D%2210%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3ESweater%3C/text%3E%3C/svg%3E',
      'Shoes': 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fff3e0%22/%3E%3Cellipse%20cx%3D%22200%22%20cy%3D%22150%22%20rx%3D%22100%22%20ry%3D%2230%22%20fill%3D%22%23424242%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22100%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23424242%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EShoes%3C/text%3E%3C/svg%3E',
      'Accessories': 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fff8e1%22/%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22150%22%20r%3D%2250%22%20fill%3D%22%23ff9800%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3EAccessory%3C/text%3E%3C/svg%3E'
    };
    
    const getImagePath = (category: string) => {
      return categoryMap[category] || categoryMap['T-Shirts'];
    };

    const mainImage = getImagePath(category);
    const alternateImages = [
      categoryMap['T-Shirts'],
      categoryMap['Jeans'], 
      categoryMap['Dresses']
    ];

    return {
      id,
      name: `Premium ${category.slice(0, -1)} ${id}`,
      description: `High-quality ${category.toLowerCase()} perfect for any occasion.`,
      longDescription: `This premium ${category.toLowerCase()} is crafted with the finest materials and attention to detail. Perfect for both casual and formal occasions, it combines comfort with style. The modern design and superior craftsmanship make it a must-have addition to your wardrobe.`,
      price,
      originalPrice,
      imageUrl: mainImage,
      images: [
        mainImage,
        ...alternateImages
      ],
      category,
      brand,
      rating: Math.floor(Math.random() * 2) + 3 + Math.random(),
      reviewCount: Math.floor(Math.random() * 200) + 5,
      sizes: [
        { size: 'XS', available: true, stockCount: 5 },
        { size: 'S', available: true, stockCount: 10 },
        { size: 'M', available: true, stockCount: 15 },
        { size: 'L', available: true, stockCount: 8 },
        { size: 'XL', available: true, stockCount: 3 }
      ],
      colors: [
        { name: 'Black', hex: '#000000', available: true, images: [mainImage] },
        { name: 'White', hex: '#FFFFFF', available: true, images: [mainImage] },
        { name: 'Navy', hex: '#000080', available: true, images: [mainImage] }
      ],
      tags: ['premium', 'comfortable', 'stylish'],
      inStock: true,
      stockCount: 50,
      isNew: Math.random() > 0.8,
      isSale: !!originalPrice,
      isFeatured: Math.random() > 0.9,
      specifications: {
        'Material': '100% Premium Cotton',
        'Fit': 'Regular Fit',
        'Origin': 'Made in USA',
        'Weight': '180 GSM'
      },
      materials: ['100% Cotton', 'Pre-shrunk fabric'],
      careInstructions: ['Machine wash cold', 'Tumble dry low', 'Do not bleach'],
      shippingInfo: {
        standard: { price: 5.99, days: '5-7 business days' },
        express: { price: 12.99, days: '2-3 business days' },
        overnight: { price: 24.99, days: '1 business day' }
      },
      returnPolicy: '30-day return policy. Items must be unworn and in original condition.',
      createdAt: new Date()
    };
  }

  private loadRelatedProducts(): void {
    this.relatedProducts = Array.from({ length: 4 }, (_, i) => 
      this.generateMockProduct(`related-${i + 1}`)!
    );
  }

  private loadReviews(): void {
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
      images: Math.random() > 0.7 ? [this.placeholderImage] : undefined
    }));
  }

  private checkWishlistStatus(): void {
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
    const selectedColorData = this.product?.colors?.find(c => c.name === color);
    if (selectedColorData && selectedColorData.images.length > 0) {
      this.selectedImageIndex = 0;
    }
  }

  onSizeSelect(size: string): void {
    this.selectedSize = size;
  }

  onQuantityChange(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= this.maxQuantity) {
      this.quantity = newQuantity;
    }
  }

  get selectedSizeData(): ProductSize | undefined {
    return this.product?.sizes?.find(s => s.size === this.selectedSize);
  }

  onTabChange(tab: string): void {
    this.activeTab = tab as 'description' | 'specifications' | 'reviews' | 'shipping';
  }

  async onAddToCart(): Promise<void> {
    if (!this.product) return;

    // Validate selection
    if (this.hasSizes && !this.selectedSize) {
      alert('Please select a size');
      return;
    }

    if (this.hasColors && !this.selectedColor) {
      alert('Please select a color');
      return;
    }

    this.isAddingToCart = true;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Product added to cart:', {
        id: this.product.id,
        name: this.product.name,
        size: this.selectedSize,
        color: this.selectedColor,
        quantity: this.quantity,
        price: this.product.price
      });

      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      this.isAddingToCart = false;
    }
  }

  async onToggleWishlist(): Promise<void> {
    if (!this.product) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isInWishlist = !this.isInWishlist;
      console.log(`Product ${this.isInWishlist ? 'added to' : 'removed from'} wishlist:`, this.product.name);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    }
  }

  onReviewHelpful(reviewId: string): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful++;
    }
  }

  onShowMoreReviews(): void {
    this.showAllReviews = true;
  }

  get displayedReviews(): Review[] {
    return this.showAllReviews ? this.reviews : this.reviews.slice(0, this.reviewsToShow);
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
    return Math.min(sizeStock, totalStock, 10);
  }

  get discountPercentage(): number {
    if (!this.product?.originalPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  get canAddToCart(): boolean {
    if (!this.product?.inStock) return false;
    if (this.hasSizes && !this.selectedSize) return false;
    if (this.hasColors && !this.selectedColor) return false;
    return true;
  }

  onBuyNow(): void {
    if (!this.canAddToCart) return;
    
    // For now, just add to cart and redirect to checkout
    this.onAddToCart().then(() => {
      this.router.navigate(['/checkout']);
    });
  }

  getDisplayedReviews(): Review[] {
    return this.showAllReviews ? this.reviews : this.reviews.slice(0, this.reviewsToShow);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== '/assets/placeholder-product.svg') {
      console.log('Image failed to load, using fallback:', img.src);
      img.src = '/assets/placeholder-product.svg';
    }
  }
}