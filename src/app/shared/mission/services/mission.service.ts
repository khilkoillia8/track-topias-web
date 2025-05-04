import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MissionDto, MissionCreationDto } from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = `${environment.apiUrl}/missions`;

  constructor(private http: HttpClient) {}

  getAllMissions(): Observable<MissionDto[]> {
    return this.http.get<MissionDto[]>(this.apiUrl);
  }
  
  getAllMissionsByUserId(id: number): Observable<MissionDto[]> {
    return this.http.get<MissionDto[]>(`${this.apiUrl}/user/${id}`);
  }

  getMissionById(id: number): Observable<MissionDto> {
    return this.http.get<MissionDto>(`${this.apiUrl}/${id}`);
  }

  createMission(mission: MissionCreationDto): Observable<MissionDto> {
    return this.http.post<MissionDto>(this.apiUrl, mission);
  }

  updateMission(id: number, mission: MissionCreationDto): Observable<MissionDto> {
    return this.http.put<MissionDto>(`${this.apiUrl}/${id}`, mission);
  }

  deleteMission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
