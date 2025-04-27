import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from "../../../../environments/environment";
import {User, UserCredentials} from '../models/auth.model';
import jwt_decode from 'jwt-decode'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null)

  constructor(private http: HttpClient) {
  }

  isTokenValid(token: string): boolean {
    try {
      const decodedToken: { id: number; sub: string; roles: string; exp: number, eml: string } = jwt_decode(token)
      const currentTime = Math.floor(Date.now() / 1000)

      if (decodedToken.exp < currentTime) {
        return false
      }

      this.user$.next({id: decodedToken.id, username: decodedToken.sub, role: decodedToken.roles, email: decodedToken.eml})
      return true
    } catch (error) {
      return false
    }
  }

  signIn({username, password}: { username: string; password: string}): Observable<UserCredentials> {
    return this.http.post<UserCredentials>(`${environment.apiUrl}/auth/sign-in`, {username, password})
  }

  signUp({username, password, email}: { username: string; password: string; email: string }): Observable<UserCredentials> {
    return this.http.post<UserCredentials>(`${environment.apiUrl}/auth/sign-up`, {username, password, email})
  }
}