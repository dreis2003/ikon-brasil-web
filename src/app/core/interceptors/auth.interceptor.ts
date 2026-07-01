import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const deveAssinar = request.url.startsWith(environment.apiUrl)
    && !request.url.includes(`${environment.apiUrl}/auth/login`)
    && !request.url.includes(`${environment.apiUrl}/filiados/publico/`)
    && !request.url.includes(`${environment.apiUrl}/cep/`);

  if (!token || !deveAssinar) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};
