import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output() appClickOutside = new EventEmitter<Event>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('touchstart', this.onDocumentClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('touchstart', this.onDocumentClick);
  }

  private onDocumentClick = (event: Event): void => {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.appClickOutside.emit(event);
    }
  }
}