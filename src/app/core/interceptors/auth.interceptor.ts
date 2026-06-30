import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const deveAssinar = request.url.startsWith(environment.bffUrl)
    && !request.url.includes('/api/auth/login')
    && !request.url.includes('/api/filiados/publico/')
    && !request.url.includes('/api/cep/');

  if (!token || !deveAssinar) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};
