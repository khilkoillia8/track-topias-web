import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HabitInstanceDto } from '../models/habit-instance.model';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HabitInstanceService {
  private apiUrl = `${environment.apiUrl}/habit-instances`;

  constructor(private http: HttpClient) {}

  getInstancesByHabitId(habitId: number): Observable<HabitInstanceDto[]> {
    return this.http.get<HabitInstanceDto[]>(`${this.apiUrl}/habit/${habitId}`);
  }

  getActiveInstancesByHabitId(habitId: number): Observable<HabitInstanceDto[]> {
    return this.http.get<HabitInstanceDto[]>(`${this.apiUrl}/habit/${habitId}/active`);
  }

  getUserInstances(): Observable<HabitInstanceDto[]> {
    return this.http.get<HabitInstanceDto[]>(this.apiUrl);
  }

  getActiveUserInstances(): Observable<HabitInstanceDto[]> {
    return this.http.get<HabitInstanceDto[]>(`${this.apiUrl}/active`);
  }

  getInstancesByDate(date: Date): Observable<HabitInstanceDto[]> {
    const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    return this.http.get<HabitInstanceDto[]>(`${this.apiUrl}/date/${formattedDate}`);
  }

  getInstancesByDateRange(startDate: Date, endDate: Date): Observable<HabitInstanceDto[]> {
    const formattedStartDate = formatDate(startDate, 'yyyy-MM-dd', 'en-US');
    const formattedEndDate = formatDate(endDate, 'yyyy-MM-dd', 'en-US');
    
    let params = new HttpParams()
      .set('startDate', formattedStartDate)
      .set('endDate', formattedEndDate);
    
    return this.http.get<HabitInstanceDto[]>(`${this.apiUrl}/range`, { params });
  }

  completeInstance(id: number): Observable<HabitInstanceDto> {
    return this.http.post<HabitInstanceDto>(`${this.apiUrl}/${id}/complete`, {});
  }

  generateInstances(habitId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/habit/${habitId}/generate`, {});
  }
}
