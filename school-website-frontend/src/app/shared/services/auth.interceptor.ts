import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'school_saas_token';

/**
 * Attaches the JWT bearer token (if present) to outgoing API requests and, on a
 * 401, clears the stored session so the app falls back to the login screen.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let authReq = req;
  if (typeof sessionStorage !== 'undefined') {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem('school_saas_user');
      }
      return throwError(() => err);
    })
  );
};
