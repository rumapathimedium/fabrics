import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

// Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { LazyLoadDirective } from './directives/lazy-load.directive';
import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';

// Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

const COMPONENTS = [
  ErrorMessageComponent,
  LoadingSpinnerComponent
];

const DIRECTIVES = [
  ClickOutsideDirective,
  AutoFocusDirective,
  TooltipDirective,
  LazyLoadDirective,
  InfiniteScrollDirective
];

const PIPES = [
  TruncatePipe,
  DateAgoPipe,
  CurrencyFormatPipe,
  FileSizePipe,
  HighlightPipe,
  SafeHtmlPipe
];

@NgModule({
  imports: [
    CommonModule,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ],
  exports: [
    CommonModule,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ]
})
export class SharedModule { }