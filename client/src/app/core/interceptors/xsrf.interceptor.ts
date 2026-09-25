import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');
  const isApiRequest = apiOrigin.startsWith('http')
    ? req.url.startsWith(apiOrigin)
    : req.url.startsWith('/');

  let headers = req.headers;
  if (isApiRequest && req.method !== 'GET' && req.method !== 'HEAD') {
    const token = readCookie('XSRF-TOKEN');
    if (token) {
      headers = headers.set('X-XSRF-TOKEN', token);
    }
  }

  return next(req.clone({ headers, withCredentials: true }));
};
