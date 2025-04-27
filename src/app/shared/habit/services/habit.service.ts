import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HabitDto, HabitCreationDto } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = `${environment.apiUrl}/habits`;

  constructor(private http: HttpClient) {}

  getAllHabits(): Observable<HabitDto[]> {
    return this.http.get<HabitDto[]>(this.apiUrl);
  }

  getHabitById(id: number): Observable<HabitDto> {
    return this.http.get<HabitDto>(`${this.apiUrl}/${id}`);
  }

  createHabit(habit: HabitCreationDto): Observable<HabitDto> {
    return this.http.post<HabitDto>(this.apiUrl, habit);
  }

  updateHabit(id: number, habit: HabitCreationDto): Observable<HabitDto> {
    return this.http.put<HabitDto>(`${this.apiUrl}/${id}`, habit);
  }

  deleteHabit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
