import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith("/api")) {
    return next(
      req.clone({
        url: new URL(req.url, environment.apiOrigin).toString(),
        withCredentials: true,
      }),
    );
  }
  return next(req);
};
