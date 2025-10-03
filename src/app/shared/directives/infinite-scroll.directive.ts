import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Input() scrollThreshold = 300;
  @Input() scrollContainer?: string;
  @Input() infiniteScrollDisabled = false;

  private scrollContainer_?: HTMLElement;
  private observer?: IntersectionObserver;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupScrollContainer();
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupScrollContainer(): void {
    if (this.scrollContainer) {
      this.scrollContainer_ = document.querySelector(this.scrollContainer) as HTMLElement;
    } else {
      this.scrollContainer_ = window.document.documentElement;
    }
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.setupScrollListener();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.infiniteScrollDisabled) {
            this.triggerScroll();
          }
        });
      },
      {
        root: this.scrollContainer ? this.scrollContainer_ : null,
        rootMargin: `${this.scrollThreshold}px`,
        threshold: 0.1
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private setupScrollListener(): void {
    const scrollElement = this.scrollContainer_ || window;
    
    const scrollListener = () => {
      if (this.infiniteScrollDisabled) return;

      const elementPosition = this.elementRef.nativeElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (elementPosition.top <= windowHeight + this.scrollThreshold) {
        this.triggerScroll();
      }
    };

    this.renderer.listen(scrollElement, 'scroll', scrollListener);
  }

  private triggerScroll(): void {
    const event = new CustomEvent('infiniteScroll', {
      detail: { element: this.elementRef.nativeElement }
    });
    this.elementRef.nativeElement.dispatchEvent(event);
  }
}