import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {environment} from "../../../../environments/environment";
import {User} from "../models/auth.model";
import {Level} from "../models/level.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private availableUsersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  private currentUserLevel: BehaviorSubject<Level> = new BehaviorSubject<Level>({} as Level);

  constructor(private http: HttpClient) {}

  getAvailableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`).pipe(
      tap(users => this.availableUsersSubject.next(users))
    );
  }
  
  getLevelByUserId(userId: number): Observable<Level> {
    return this.http.get<Level>(`${environment.apiUrl}/users/${userId}/level`).pipe(
      tap(level => this.currentUserLevel.next(level))
    );
  }
}