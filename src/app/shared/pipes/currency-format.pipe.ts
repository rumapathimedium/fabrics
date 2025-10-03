import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number, 
    currencyCode: string = 'USD', 
    locale: string = 'en-US',
    showSymbol: boolean = true
  ): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const formatted = formatter.format(value);
      
      if (!showSymbol) {
        // Remove currency symbol and trim
        return formatted.replace(/[^\d.,\s-]/g, '').trim();
      }
      
      return formatted;
    } catch (error) {
      // Fallback formatting
      const symbol = this.getCurrencySymbol(currencyCode);
      return `${showSymbol ? symbol : ''}${value.toFixed(2)}`;
    }
  }

  private getCurrencySymbol(currencyCode: string): string {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹'
    };
    
    return symbols[currencyCode] || currencyCode;
  }
}