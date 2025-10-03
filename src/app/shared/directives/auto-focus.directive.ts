import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements OnInit, OnDestroy {
  @Input() appAutoFocus: boolean = true;
  @Input() autoFocusDelay: number = 0;

  private timeoutId?: number;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.appAutoFocus) {
      this.timeoutId = window.setTimeout(() => {
        this.elementRef.nativeElement.focus();
      }, this.autoFocusDelay);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}