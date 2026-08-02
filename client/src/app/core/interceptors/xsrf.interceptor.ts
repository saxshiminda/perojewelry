import { HttpInterceptorFn } from '@angular/common/http';

export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Use Angular's default behavior for XSRF with relative URLs
  // HttpClient should now automatically handle XSRF if we use the proxy
  // because the origin will be the same (localhost:4200)
  
  return next(req.clone({ withCredentials: true }));
};
