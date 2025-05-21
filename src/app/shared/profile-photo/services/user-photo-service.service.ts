import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class UserPhotoService {
  private apiUrl = `${environment.apiUrl}/api/users`; 
  private maxSizeBytes = 5 * 1024 * 1024;
  private photoCache: Map<number, { url: SafeUrl, timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer
  ) {}

  getUserPhoto(userId: number): Observable<Blob | null> {
    return this.http.get(`${this.apiUrl}/${userId}/photo`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'image/*'
      }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => new Error(this.handleErrorMessage(error)));
      })
    );
  }

  getUserPhotoUrl(userId: number): Observable<SafeUrl | null> {
    const cached = this.photoCache.get(userId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < this.cacheDuration)) {
      return of(cached.url);
    }
    
    return this.getUserPhoto(userId).pipe(
      switchMap(blob => {
        if (!blob) {
          return of(null);
        }
        
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        
        this.photoCache.set(userId, { 
          url: safeUrl, 
          timestamp: now 
        });
        
        return of(safeUrl);
      })
    );
  }

  uploadUserPhoto(userId: number, file: File): Observable<string> {
    if (file.size > this.maxSizeBytes) {
      return throwError(() => new Error(this.translateService.instant('photo.error.fileSize')));
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.put(`${this.apiUrl}/${userId}/photo`, formData, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      switchMap(response => {
        if (response.status === 200) {
          this.photoCache.delete(userId);
          return of(response.body as string);
        } else {
          return throwError(() => new Error(`Unexpected status code: ${response.status}`));
        }
      }),
      catchError(() => {
        return of('Photo uploaded successfully');
      })
    );
  }

  private handleErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return error.error.message;
    } else {
      return error.error?.message || `Error Code: ${error.status}`;
    }
  }
}
