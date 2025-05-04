import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {MissionDto} from "../../mission/models/mission.model";
import { HabitDto, HabitCreationDto } from '../models/habit.model';

export interface HabitStreakResponse {
  currentStreak: number;
  bestStreak: number;
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = `${environment.apiUrl}/habits`;

  constructor(private http: HttpClient) {}

  getAllHabits(): Observable<HabitDto[]> {
    return this.http.get<HabitDto[]>(this.apiUrl);
  }
  getAllHabitsByUserId(userId: number) {
    return this.http.get<HabitDto[]>(`${this.apiUrl}/user/${userId}`);
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
  
  resetHabit(id: number): Observable<HabitDto> {
    return this.http.post<HabitDto>(`${this.apiUrl}/${id}/reset`, {});
  }
  
  regenerateHabitInstances(id: number): Observable<HabitDto> {
    return this.http.post<HabitDto>(`${this.apiUrl}/${id}/regenerate`, {});
  }
  
  getHabitStreak(id: number): Observable<HabitStreakResponse> {
    return this.http.get<HabitStreakResponse>(`${this.apiUrl}/${id}/streak`);
  }
  
  updateHabitStreak(id: number): Observable<HabitDto> {
    return this.http.post<HabitDto>(`${this.apiUrl}/${id}/update-streak`, {});
  }
}
