import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  createdAt: Date;
}

interface FilterOptions {
  category?: string;
  priceRange?: { min: number; max: number };
  sizes?: string[];
  colors?: string[];
  brands?: string[];
  inStock?: boolean;
  rating?: number;
}

interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private loadingTimeout?: any;
  private retryCount = 0;
  private maxRetries = 3;
  
  // Base64 encoded placeholder image
  private placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U5ZWNlZiIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iIGZpbGw9IiM2Yzc1N2QiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+';
  
  // State management
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  isLoading = false;
  
  // Search and filters
  searchTerm = '';
  private searchSubject = new BehaviorSubject<string>('');
  selectedCategory = '';
  selectedBrand = '';
  selectedSort = 'name-asc';
  priceRange = { min: 0, max: 1000 };
  selectedSizes: string[] = [];
  selectedColors: string[] = [];
  showFilters = false;
  
  // View options
  viewMode: 'grid' | 'list' = 'grid';
  productsPerPage = 12;
  currentPage = 1;
  totalPages = 1;
  
  // Filter options
  categories: string[] = [];
  brands: string[] = [];
  sizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  colors: string[] = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown'];
  
  sortOptions: SortOption[] = [
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price-asc', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Reset state
    this.retryCount = 0;
    this.currentPage = 1;
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.searchTerm = '';
    this.selectedSizes = [];
    this.selectedColors = [];
    
    // Load products immediately without setTimeout for initial load
    this.loadProductsSync();
    
    this.setupSearch();
    this.setupRouteParams();
  }

  loadProductsSync(): void {
    this.isLoading = true;
    
    try {
      this.products = this.generateMockProducts();
      
      if (this.products.length > 0) {
        this.extractFilterOptions();
        this.applyFilters();
      }
    } catch (error) {
      console.error('Error in sync product generation:', error);
      // Fallback to async loading
      this.loadProducts();
    }
    
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    console.log('ProductListComponent ngOnDestroy called');
    // Clear any pending timeouts
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });
  }

  private setupRouteParams(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.selectedBrand = params['brand'] || '';
      this.searchTerm = params['search'] || '';
      this.applyFilters();
    });
  }

  private loadProducts(): void {
    console.log('Loading products... (attempt', this.retryCount + 1, 'of', this.maxRetries, ')');
    
    // Clear any existing timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    this.isLoading = true;
    
    // Reset arrays only on first attempt
    if (this.retryCount === 0) {
      this.products = [];
      this.filteredProducts = [];
      this.displayedProducts = [];
    }
    
    // Mock data - replace with actual service call
    this.loadingTimeout = setTimeout(() => {
      // Check if component is still alive
      if (this.destroy$.closed) {
        console.log('Component destroyed, skipping product loading');
        return;
      }
      
      try {
        console.log('Generating mock products...');
        const generatedProducts = this.generateMockProducts();
        console.log('Products generated:', generatedProducts.length);
        
        if (generatedProducts.length > 0) {
          this.products = generatedProducts;
          this.extractFilterOptions();
          this.applyFilters();
          this.retryCount = 0; // Reset retry count on success
        } else {
          throw new Error('No products generated');
        }
      } catch (error) {
        console.error('Error generating products:', error);
        if (this.retryCount < this.maxRetries - 1) {
          this.retryCount++;
          console.log('Retrying product generation...');
          this.loadProducts();
          return;
        } else {
          console.error('Max retries reached, using empty product list');
          this.products = [];
          this.filteredProducts = [];
          this.displayedProducts = [];
        }
      }
      
      this.isLoading = false;
      console.log('Products loading complete. Filtered:', this.filteredProducts.length, 'Displayed:', this.displayedProducts.length);
    }, 100); // Reduced timeout significantly
  }

  private generateMockProducts(): Product[] {
    const mockProducts: Product[] = [];
    const categories = ['T-Shirts', 'Jeans', 'Dresses', 'Sweaters', 'Shoes', 'Accessories'];
    const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'];
    
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
    
    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const price = Math.floor(Math.random() * 200) + 20;
      const originalPrice = Math.random() > 0.7 ? price + Math.floor(Math.random() * 50) : undefined;
      const mainImage = getImagePath(category);
      
      mockProducts.push({
        id: `product-${i}`,
        name: `${category.slice(0, -1)} ${i}`,
        description: `High-quality ${category.toLowerCase()} perfect for any occasion. Made with premium materials.`,
        price,
        originalPrice,
        imageUrl: mainImage,
        images: [
          mainImage,
          categoryMap['T-Shirts'],
          categoryMap['Jeans']
        ],
        category,
        brand,
        rating: Math.floor(Math.random() * 2) + 3 + Math.random(),
        reviewCount: Math.floor(Math.random() * 200) + 5,
        sizes: this.getRandomSizes(),
        colors: this.getRandomColors(),
        tags: this.getRandomTags(category),
        inStock: Math.random() > 0.1,
        isNew: Math.random() > 0.8,
        isSale: !!originalPrice,
        isFeatured: Math.random() > 0.9,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      });
    }
    
    return mockProducts;
  }

  private getRandomSizes(): string[] {
    const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const count = Math.floor(Math.random() * 4) + 2;
    return allSizes.slice(0, count);
  }

  private getRandomColors(): string[] {
    const count = Math.floor(Math.random() * 3) + 1;
    return this.colors.slice(0, count);
  }

  private getRandomTags(category: string): string[] {
    const baseTags = ['comfortable', 'stylish', 'premium', 'casual', 'trendy'];
    const categoryTags: { [key: string]: string[] } = {
      'T-Shirts': ['cotton', 'breathable', 'everyday'],
      'Jeans': ['denim', 'durable', 'classic'],
      'Dresses': ['elegant', 'feminine', 'versatile'],
      'Sweaters': ['warm', 'cozy', 'knitted'],
      'Shoes': ['comfortable', 'durable', 'walking'],
      'Accessories': ['fashionable', 'functional', 'statement']
    };
    
    return [...baseTags.slice(0, 2), ...(categoryTags[category] || [])];
  }

  private extractFilterOptions(): void {
    this.categories = [...new Set(this.products.map(p => p.category))].sort();
    this.brands = [...new Set(this.products.map(p => p.brand))].sort();
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  applyFilters(): void {
    console.log('Applying filters. Products available:', this.products.length);
    let filtered = [...this.products];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Brand filter
    if (this.selectedBrand) {
      filtered = filtered.filter(product => product.brand === this.selectedBrand);
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= this.priceRange.min && product.price <= this.priceRange.max
    );

    // Size filter
    if (this.selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        this.selectedSizes.some(size => product.sizes.includes(size))
      );
    }

    // Color filter
    if (this.selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        this.selectedColors.some(color => product.colors.includes(color))
      );
    }

    // Apply sorting
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
    console.log('Filtered products:', this.filteredProducts.length);
    this.updatePagination();
  }

  private sortProducts(products: Product[]): Product[] {
    return products.sort((a, b) => {
      switch (this.selectedSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'popular':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.displayedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSizeToggle(size: string): void {
    const index = this.selectedSizes.indexOf(size);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
    } else {
      this.selectedSizes.push(size);
    }
    this.applyFilters();
  }

  onColorToggle(color: string): void {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push(color);
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.selectedSizes = [];
    this.selectedColors = [];
    this.priceRange = { min: 0, max: 1000 };
    this.searchTerm = '';
    this.searchSubject.next('');
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
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

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  get paginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.selectedCategory ||
      this.selectedBrand ||
      this.selectedSizes.length ||
      this.selectedColors.length ||
      this.searchTerm ||
      this.priceRange.min !== 0 ||
      this.priceRange.max !== 1000
    );
  }

  viewProductDetails(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  addToWishlist(product: any): void {
    // TODO: Implement wishlist functionality
    console.log('Added to wishlist:', product.name);
    // You can add a notification service here
  }
  
  // Image error handler
  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== '/assets/placeholder-product.svg') {
      console.log('Image failed to load, using fallback:', img.src);
      img.src = '/assets/placeholder-product.svg';
    }
  }
}