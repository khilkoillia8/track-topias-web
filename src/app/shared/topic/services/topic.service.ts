import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TopicDto, TopicCreationDto } from '../models/topic.model';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private apiUrl = `${environment.apiUrl}/topics`;

  constructor(private http: HttpClient) {}

  getAllTopics(): Observable<TopicDto[]> {
    return this.http.get<TopicDto[]>(this.apiUrl);
  }

  getTopicById(id: number): Observable<TopicDto> {
    return this.http.get<TopicDto>(`${this.apiUrl}/${id}`);
  }

  createTopic(topic: TopicCreationDto): Observable<TopicDto> {
    return this.http.post<TopicDto>(this.apiUrl, topic);
  }

  updateTopic(id: number, topic: TopicCreationDto): Observable<TopicDto> {
    return this.http.put<TopicDto>(`${this.apiUrl}/${id}`, topic);
  }

  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
