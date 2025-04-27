import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  CompletedHabitsByTopicDto, 
  CompletedMissionsByTopicDto, 
  UserStatisticsDto 
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

  getUserStatistics(): Observable<UserStatisticsDto> {
    return this.http.get<UserStatisticsDto>(this.apiUrl);
  }
}
