import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

export const errorParserInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            return throwError(() => {
                return err.error ?? err;
            })
        })
    );
}