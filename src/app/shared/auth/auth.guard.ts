import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from "./services/auth.service";


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const routerService = inject(Router)
  const token = localStorage.getItem('jwtToken')
  if (!token || !authService.isTokenValid(token)) {
    routerService.navigate(['/start']);
    return false
  }
  return true
}