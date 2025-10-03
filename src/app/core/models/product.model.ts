// Product related interfaces
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: ProductCategory;
  subcategory?: ProductSubcategory;
  brand: Brand;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: ProductDimensions;
  rating: ProductRating;
  createdAt: Date;
  updatedAt: Date;
  seoData?: SEOData;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  seoData?: SEOData;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
  size?: ImageSize;
}

export interface ImageSize {
  width: number;
  height: number;
  fileSize: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'style' | 'material';
  value: string;
  price?: number;
  sku?: string;
  stockQuantity: number;
  image?: string;
  isAvailable: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  unit?: string;
  isFilterable: boolean;
  displayOrder: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export interface ProductRating {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  isVerifiedPurchase: boolean;
  isRecommended: boolean;
  helpfulCount: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Search and filtering
export interface ProductFilter {
  categories?: string[];
  brands?: string[];
  priceRange?: PriceRange;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  attributes?: AttributeFilter[];
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface AttributeFilter {
  name: string;
  values: string[];
}

export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filters: AvailableFilters;
}

export interface AvailableFilters {
  categories: FilterOption[];
  brands: FilterOption[];
  priceRange: PriceRange;
  sizes: FilterOption[];
  colors: FilterOption[];
  attributes: AttributeFilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface AttributeFilterOption {
  name: string;
  options: FilterOption[];
}

// SEO related
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}