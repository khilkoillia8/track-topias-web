import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  CompletedHabitsByTopicDto, 
  CompletedMissionsByTopicDto, 
  UserStatisticsDto,
  UserHabitInstanceStatisticsDto,
  HabitInstanceStatisticsDto,
  UserRatingDto
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  getCompletedHabitsByTopic(): Observable<CompletedHabitsByTopicDto[]> {
    return this.http.get<CompletedHabitsByTopicDto[]>(`${this.apiUrl}/habits`);
  }

  getCompletedMissionsByTopic(): Observable<CompletedMissionsByTopicDto[]> {
    return this.http.get<CompletedMissionsByTopicDto[]>(`${this.apiUrl}/missions`);
  }

  getUserStatistics(userId?: number): Observable<UserStatisticsDto> {
    return this.http.get<UserStatisticsDto>(`${this.apiUrl}/user/${userId}`);
  }
  
  getMainUserStatistics(): Observable<UserStatisticsDto> {
    return this.http.get<UserStatisticsDto>(this.apiUrl);
  }

  getUserHabitInstanceStatistics(): Observable<UserHabitInstanceStatisticsDto> {
    return this.http.get<UserHabitInstanceStatisticsDto>(`${this.apiUrl}/habit-instances`);
  }

  getHabitInstanceStatisticsByHabit(): Observable<HabitInstanceStatisticsDto[]> {
    return this.http.get<HabitInstanceStatisticsDto[]>(`${this.apiUrl}/habit-instances/by-habit`);
  }

  getHabitInstanceStatisticsForHabit(habitId: number): Observable<HabitInstanceStatisticsDto> {
    return this.http.get<HabitInstanceStatisticsDto>(`${this.apiUrl}/habit-instances/habit/${habitId}`);
  }

  getUserRatingsByLevel(): Observable<UserRatingDto[]> {
    return this.http.get<UserRatingDto[]>(`${this.apiUrl}/ratings/level`);
  }

  getUserRatingsByMissionsCompleted(): Observable<UserRatingDto[]> {
    return this.http.get<UserRatingDto[]>(`${this.apiUrl}/ratings/missions`);
  }

  getUserRatingsByMaxHabitStreak(): Observable<UserRatingDto[]> {
    return this.http.get<UserRatingDto[]>(`${this.apiUrl}/ratings/habit-streak`);
  }

  getUserRatingsByHabitCompletions(): Observable<UserRatingDto[]> {
    return this.http.get<UserRatingDto[]>(`${this.apiUrl}/ratings/habit-completions`);
  }
}
