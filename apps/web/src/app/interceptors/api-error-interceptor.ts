import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    return next(req).pipe(
      catchError((e: HttpErrorResponse) => {
        return throwError(() => (e.error ?? e) as Error);
      }),
    );
  }
  return next(req);
};
