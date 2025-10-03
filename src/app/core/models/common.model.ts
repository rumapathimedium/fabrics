// Generic API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  meta?: ResponseMeta;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ResponseMeta {
  pagination?: PaginationMeta;
  filters?: any;
  sorting?: SortingMeta;
  totalCount?: number;
  requestId?: string;
  version?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SortingMeta {
  field: string;
  direction: 'asc' | 'desc';
}

// Request interfaces
export interface PaginationRequest {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterRequest {
  [key: string]: any;
}

// Error interfaces
export interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: any;
    stack?: string;
  };
  timestamp: Date;
  path?: string;
  method?: string;
}

export interface HttpError {
  status: number;
  statusText: string;
  message: string;
  error?: any;
  url?: string;
}

// Loading and state interfaces
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// File upload interfaces
export interface FileUploadResponse {
  success: boolean;
  file: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
  };
  message?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  stage: 'uploading' | 'processing' | 'complete' | 'error';
}

// Notification interfaces
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  createdAt: Date;
  read: boolean;
  persistent?: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// Analytics and tracking interfaces
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: { [key: string]: any };
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface PageView {
  url: string;
  title: string;
  referrer?: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  duration?: number;
}

// Configuration interfaces
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: FeatureFlags;
  analytics: AnalyticsConfig;
  payments: PaymentConfig;
  auth: AuthConfig;
  storage: StorageConfig;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  trackingConsent: boolean;
}

export interface PaymentConfig {
  stripePublicKey?: string;
  paypalClientId?: string;
  sandbox: boolean;
  supportedMethods: string[];
  currency: string;
}

export interface AuthConfig {
  tokenKey: string;
  refreshTokenKey: string;
  tokenExpiry: number;
  enableRememberMe: boolean;
  socialLogins: SocialLoginConfig[];
}

export interface SocialLoginConfig {
  provider: 'google' | 'facebook' | 'apple' | 'twitter';
  clientId: string;
  enabled: boolean;
}

export interface StorageConfig {
  prefix: string;
  encryption: boolean;
  expiration: {
    session: number;
    permanent: number;
  };
}

// Theme and UI interfaces
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
}

// Search interfaces
export interface SearchQuery {
  query: string;
  filters?: FilterRequest;
  pagination?: PaginationRequest;
  facets?: string[];
  highlight?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: SearchFacet[];
  suggestions?: string[];
  query: string;
  took: number;
}

export interface SearchFacet {
  field: string;
  values: SearchFacetValue[];
}

export interface SearchFacetValue {
  value: string;
  count: number;
  selected: boolean;
}