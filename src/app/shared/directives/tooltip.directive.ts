import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input() appTooltip: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay: number = 500;
  @Input() tooltipOffset: number = 10;

  private tooltip?: HTMLElement;
  private showTimeout?: number;
  private hideTimeout?: number;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.addEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    this.hideTooltip();
    if (this.showTimeout) clearTimeout(this.showTimeout);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

  private addEventListeners(): void {
    this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => this.showTooltipWithDelay());
    this.renderer.listen(this.elementRef.nativeElement, 'mouseleave', () => this.hideTooltipWithDelay());
    this.renderer.listen(this.elementRef.nativeElement, 'focus', () => this.showTooltipWithDelay());
    this.renderer.listen(this.elementRef.nativeElement, 'blur', () => this.hideTooltipWithDelay());
  }

  private removeEventListeners(): void {
    // Event listeners are automatically removed when the directive is destroyed
  }

  private showTooltipWithDelay(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    if (!this.appTooltip.trim()) return;

    this.showTimeout = window.setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }

  private hideTooltipWithDelay(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }

    this.hideTimeout = window.setTimeout(() => {
      this.hideTooltip();
    }, 100);
  }

  private showTooltip(): void {
    if (this.tooltip) return;

    this.tooltip = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltip, 'tooltip');
    this.renderer.addClass(this.tooltip, `tooltip-${this.tooltipPosition}`);
    this.renderer.setProperty(this.tooltip, 'textContent', this.appTooltip);

    // Styles
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'z-index', '9999');
    this.renderer.setStyle(this.tooltip, 'background-color', '#1a202c');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '8px 12px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltip, 'font-size', '14px');
    this.renderer.setStyle(this.tooltip, 'font-weight', '500');
    this.renderer.setStyle(this.tooltip, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltip, 'box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)');
    this.renderer.setStyle(this.tooltip, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltip, 'opacity', '0');
    this.renderer.setStyle(this.tooltip, 'transition', 'opacity 0.2s ease');

    this.renderer.appendChild(document.body, this.tooltip);

    // Position tooltip
    this.positionTooltip();

    // Show with animation
    setTimeout(() => {
      if (this.tooltip) {
        this.renderer.setStyle(this.tooltip, 'opacity', '1');
      }
    }, 10);
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = undefined;
    }
  }

  private positionTooltip(): void {
    if (!this.tooltip) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top - tooltipRect.height - this.tooltipOffset;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + this.tooltipOffset;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - this.tooltipOffset;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + this.tooltipOffset;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 10;
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 10;
    if (top < 0) top = 10;
    if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 10;

    this.renderer.setStyle(this.tooltip, 'top', `${top + window.scrollY}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left + window.scrollX}px`);
  }
}