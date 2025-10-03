import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Basic HTML sanitization - remove potentially dangerous tags and attributes
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'];
    const allowedAttributes = ['href', 'target', 'class', 'id'];

    // Remove script tags and their content
    let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove on* event attributes
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Keep only allowed tags
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });

    return sanitized;
  }
}