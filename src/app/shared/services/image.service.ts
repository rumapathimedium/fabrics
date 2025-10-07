import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  
  // Simple placeholder using a solid color data URI
  private readonly PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e9ecef%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%236c757d%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2218%22%3EProduct%20Image%3C/text%3E%3C/svg%3E';
  
  // Alternative simple gray rectangle
  private readonly SIMPLE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzZjNzU3ZCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4Ij5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  
  // Tiny 1x1 pixel placeholder as fallback
  private readonly MINIMAL_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  
  getPlaceholderImage(): string {
    return this.PLACEHOLDER_IMAGE;
  }
  
  getSimplePlaceholder(): string {
    return this.SIMPLE_PLACEHOLDER;
  }
  
  getMinimalPlaceholder(): string {
    return this.MINIMAL_PLACEHOLDER;
  }
  
  onImageError(event: Event, fallbackUrl?: string): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      console.log('Image failed to load:', img.src);
      // Try fallback first, then default to placeholder
      if (fallbackUrl && img.src !== fallbackUrl) {
        img.src = fallbackUrl;
      } else {
        img.src = this.getPlaceholderImage();
      }
    }
  }
  
  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.log('Image loaded successfully:', img.src.substring(0, 50) + (img.src.length > 50 ? '...' : ''));
  }

  /**
   * Get the proper image path, handling both relative and absolute URLs
   */
  getImagePath(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') {
      return this.getPlaceholderImage();
    }
    
    // If it's already a data URL or absolute URL, return as is
    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For relative paths, ensure they start with /
    if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath;
    }
    
    return imagePath;
  }
}