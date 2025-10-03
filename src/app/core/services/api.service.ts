import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  ApiResponse, 
  PaginationRequest, 
  FilterRequest, 
  ResponseMeta,
  HttpError
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Generic GET method
  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(map(response => response.data as T));
  }

  // Generic POST method
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(map(response => response.data as T));
  }

  // Generic PUT method
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(map(response => response.data as T));
  }

  // Generic PATCH method
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(map(response => response.data as T));
  }

  // Generic DELETE method
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(map(response => response.data as T));
  }

  // GET with full response (includes meta data)
  getWithMeta<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  // Paginated GET method
  getPaginated<T>(
    endpoint: string, 
    pagination: PaginationRequest, 
    filters?: FilterRequest
  ): Observable<{ data: T[]; meta: ResponseMeta }> {
    const params = {
      ...pagination,
      ...filters
    };
    
    return this.getWithMeta<T[]>(endpoint, params).pipe(
      map(response => ({
        data: response.data || [],
        meta: response.meta || {}
      }))
    );
  }

  // Search method
  search<T>(
    endpoint: string,
    query: string,
    filters?: FilterRequest,
    pagination?: PaginationRequest
  ): Observable<{ data: T[]; meta: ResponseMeta }> {
    const params = {
      q: query,
      ...filters,
      ...pagination
    };

    return this.getPaginated<T>(endpoint, params);
  }

  // File upload method
  uploadFile(endpoint: string, file: File, additionalData?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}${endpoint}`, formData)
      .pipe(map(response => response.data));
  }

  // Multiple file upload method
  uploadFiles(endpoint: string, files: File[], additionalData?: any): Observable<any> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}${endpoint}`, formData)
      .pipe(map(response => response.data));
  }

  // Download file method
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      responseType: 'blob'
    });
  }

  // Batch operations
  batchGet<T>(endpoints: string[]): Observable<T[]> {
    const requests = endpoints.map(endpoint => this.get<T>(endpoint));
    return new Observable<T[]>(observer => {
      Promise.all(requests.map(req => req.toPromise()))
        .then(results => {
          observer.next(results as T[]);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  // Health check method
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // API version method
  getApiVersion(): Observable<string> {
    return this.http.get<{ version: string }>(`${this.baseUrl}/version`)
      .pipe(map(response => response.version));
  }

  // Build HTTP params from object
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    
    return httpParams;
  }

  // Error handling helper
  handleApiError(error: any): HttpError {
    return {
      status: error.status || 0,
      statusText: error.statusText || 'Unknown Error',
      message: error.error?.message || error.message || 'An unexpected error occurred',
      error: error.error,
      url: error.url
    };
  }

  // Retry with exponential backoff
  retryWithBackoff<T>(
    operation: () => Observable<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Observable<T> {
    return new Observable<T>(observer => {
      let retryCount = 0;
      
      const executeOperation = () => {
        operation().subscribe({
          next: value => observer.next(value),
          complete: () => observer.complete(),
          error: error => {
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = baseDelay * Math.pow(2, retryCount - 1);
              setTimeout(executeOperation, delay);
            } else {
              observer.error(error);
            }
          }
        });
      };
      
      executeOperation();
    });
  }
}