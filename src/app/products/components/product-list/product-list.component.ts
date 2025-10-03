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
    this.loadProducts();
    this.setupSearch();
    this.setupRouteParams();
  }

  ngOnDestroy(): void {
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
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.products = this.generateMockProducts();
      this.extractFilterOptions();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  private generateMockProducts(): Product[] {
    const mockProducts: Product[] = [];
    const categories = ['T-Shirts', 'Jeans', 'Dresses', 'Sweaters', 'Shoes', 'Accessories'];
    const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'];
    
    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const price = Math.floor(Math.random() * 200) + 20;
      const originalPrice = Math.random() > 0.7 ? price + Math.floor(Math.random() * 50) : undefined;
      
      mockProducts.push({
        id: `product-${i}`,
        name: `${category.slice(0, -1)} ${i}`,
        description: `High-quality ${category.toLowerCase()} perfect for any occasion. Made with premium materials.`,
        price,
        originalPrice,
        imageUrl: `https://picsum.photos/300/400?random=${i}`,
        images: [
          `https://picsum.photos/300/400?random=${i}`,
          `https://picsum.photos/300/400?random=${i + 100}`,
          `https://picsum.photos/300/400?random=${i + 200}`
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
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    
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
}