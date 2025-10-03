import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'small' | 'medium' | 'large' | 'xlarge';
export type SpinnerType = 'circular' | 'dots' | 'pulse' | 'bars' | 'wave';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  @Input() size: SpinnerSize = 'medium';
  @Input() type: SpinnerType = 'circular';
  @Input() color: string = '#3182ce';
  @Input() message: string = '';
  @Input() overlay: boolean = false;
  @Input() transparent: boolean = false;
  @Input() fullscreen: boolean = false;
  @Input() centered: boolean = true;
  @Input() inline: boolean = false;

  getSizeClass(): string {
    return `spinner-${this.size}`;
  }

  getTypeClass(): string {
    return `spinner-${this.type}`;
  }

  getContainerClass(): string {
    const classes = ['loading-container'];
    
    if (this.overlay) classes.push('overlay');
    if (this.transparent) classes.push('transparent');
    if (this.fullscreen) classes.push('fullscreen');
    if (this.centered) classes.push('centered');
    if (this.inline) classes.push('inline');
    
    return classes.join(' ');
  }

  getSpinnerStyle(): { [key: string]: string } {
    return {
      '--spinner-color': this.color
    };
  }
}