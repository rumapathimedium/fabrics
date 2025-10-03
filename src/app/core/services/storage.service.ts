import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'cloth_';
  private isSSR = typeof window === 'undefined';

  constructor() {}

  // Local Storage methods
  setItem(key: string, value: any): void {
    if (this.isSSR) return;
    
    try {
      const prefixedKey = this.PREFIX + key;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  getItem<T>(key: string, defaultValue?: T): T | null {
    if (this.isSSR) return defaultValue || null;
    
    try {
      const prefixedKey = this.PREFIX + key;
      const serializedValue = localStorage.getItem(prefixedKey);
      
      if (serializedValue === null) {
        return defaultValue || null;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue || null;
    }
  }

  removeItem(key: string): void {
    if (this.isSSR) return;
    
    try {
      const prefixedKey = this.PREFIX + key;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  clear(): void {
    if (this.isSSR) return;
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Session Storage methods
  setSessionItem(key: string, value: any): void {
    if (this.isSSR) return;
    
    try {
      const prefixedKey = this.PREFIX + key;
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(prefixedKey, serializedValue);
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
    }
  }

  getSessionItem<T>(key: string, defaultValue?: T): T | null {
    if (this.isSSR) return defaultValue || null;
    
    try {
      const prefixedKey = this.PREFIX + key;
      const serializedValue = sessionStorage.getItem(prefixedKey);
      
      if (serializedValue === null) {
        return defaultValue || null;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return defaultValue || null;
    }
  }

  removeSessionItem(key: string): void {
    if (this.isSSR) return;
    
    try {
      const prefixedKey = this.PREFIX + key;
      sessionStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
    }
  }

  clearSession(): void {
    if (this.isSSR) return;
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  // Cookie methods (for SSR compatibility)
  setCookie(name: string, value: any, days: number = 30): void {
    if (this.isSSR) return;
    
    try {
      const prefixedName = this.PREFIX + name;
      const serializedValue = JSON.stringify(value);
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = `${prefixedName}=${serializedValue};${expires};path=/;SameSite=Strict`;
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  }

  getCookie<T>(name: string, defaultValue?: T): T | null {
    if (this.isSSR) return defaultValue || null;
    
    try {
      const prefixedName = this.PREFIX + name + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      
      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(prefixedName) === 0) {
          const cookieValue = cookie.substring(prefixedName.length, cookie.length);
          return JSON.parse(cookieValue);
        }
      }
      
      return defaultValue || null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return defaultValue || null;
    }
  }

  removeCookie(name: string): void {
    if (this.isSSR) return;
    
    try {
      const prefixedName = this.PREFIX + name;
      document.cookie = `${prefixedName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    } catch (error) {
      console.error('Error removing cookie:', error);
    }
  }

  // Utility methods
  isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    if (this.isSSR) return false;
    
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, 'test');
      storage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  getStorageSize(type: 'localStorage' | 'sessionStorage'): number {
    if (this.isSSR) return 0;
    
    try {
      const storage = window[type];
      let totalSize = 0;
      
      for (let key in storage) {
        if (storage.hasOwnProperty(key) && key.startsWith(this.PREFIX)) {
          totalSize += storage[key].length + key.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  // Backup and restore methods
  exportData(): any {
    if (this.isSSR) return {};
    
    try {
      const data: any = {};
      
      // Export localStorage
      data.localStorage = {};
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          const cleanKey = key.replace(this.PREFIX, '');
          data.localStorage[cleanKey] = localStorage.getItem(key);
        }
      });
      
      // Export sessionStorage
      data.sessionStorage = {};
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          const cleanKey = key.replace(this.PREFIX, '');
          data.sessionStorage[cleanKey] = sessionStorage.getItem(key);
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return {};
    }
  }

  importData(data: any): void {
    if (this.isSSR || !data) return;
    
    try {
      // Import localStorage
      if (data.localStorage) {
        Object.keys(data.localStorage).forEach(key => {
          localStorage.setItem(this.PREFIX + key, data.localStorage[key]);
        });
      }
      
      // Import sessionStorage
      if (data.sessionStorage) {
        Object.keys(data.sessionStorage).forEach(key => {
          sessionStorage.setItem(this.PREFIX + key, data.sessionStorage[key]);
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }

  // Watch for storage changes
  watchStorageChanges(callback: (event: StorageEvent) => void): void {
    if (this.isSSR) return;
    
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith(this.PREFIX)) {
        callback(event);
      }
    });
  }

  // Encrypted storage methods (basic implementation)
  setEncryptedItem(key: string, value: any, password: string): void {
    try {
      const encrypted = this.simpleEncrypt(JSON.stringify(value), password);
      this.setItem(key, encrypted);
    } catch (error) {
      console.error('Error setting encrypted item:', error);
    }
  }

  getEncryptedItem<T>(key: string, password: string, defaultValue?: T): T | null {
    try {
      const encrypted = this.getItem<string>(key);
      if (!encrypted) return defaultValue || null;
      
      const decrypted = this.simpleDecrypt(encrypted, password);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error getting encrypted item:', error);
      return defaultValue || null;
    }
  }

  // Simple encryption (not cryptographically secure - use for basic obfuscation only)
  private simpleEncrypt(text: string, password: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result);
  }

  private simpleDecrypt(encryptedText: string, password: string): string {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }
}