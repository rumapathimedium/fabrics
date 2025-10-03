import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit {
  @Input() appLazyLoad: string = '';
  @Input() placeholder: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';

  private observer?: IntersectionObserver;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (this.appLazyLoad && 'IntersectionObserver' in window) {
      this.setupLazyLoading();
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }
  }

  private setupLazyLoading(): void {
    // Set placeholder initially
    this.renderer.setAttribute(this.elementRef.nativeElement, 'src', this.placeholder);
    this.renderer.addClass(this.elementRef.nativeElement, 'lazy-loading');

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            if (this.observer) {
              this.observer.unobserve(this.elementRef.nativeElement);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private loadImage(): void {
    if (!this.appLazyLoad) return;

    const img = new Image();
    
    img.onload = () => {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'src', this.appLazyLoad);
      this.renderer.removeClass(this.elementRef.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.elementRef.nativeElement, 'lazy-loaded');
    };

    img.onerror = () => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.elementRef.nativeElement, 'lazy-error');
    };

    img.src = this.appLazyLoad;
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}