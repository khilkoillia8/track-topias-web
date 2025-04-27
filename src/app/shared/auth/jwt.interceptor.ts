import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtToken = getJwtToken()
  if (jwtToken) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })

    return next(cloned)
  }
  return next(req)
}
function getJwtToken(): string | null {
  const tokens: any = localStorage.getItem('jwtToken')
  if (!tokens) return null
  return tokens
}