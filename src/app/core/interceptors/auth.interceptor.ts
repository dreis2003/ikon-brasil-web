import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { PUBLIC_REQUEST } from './public-request.context';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const requisicaoPublica = request.context.get(PUBLIC_REQUEST) || ehRequisicaoPublica(request.url);
  const deveAssinar = request.url.startsWith(environment.apiUrl) && !requisicaoPublica;

  if (requisicaoPublica) {
    return next(request.clone({
      headers: request.headers.delete('Authorization'),
    }));
  }

  if (!token || !deveAssinar) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};

function ehRequisicaoPublica(url: string): boolean {
  return url.includes('/api/auth/login')
    || url.includes('/api/auth/refresh')
    || url.includes('/api/bff/publico/graduacoes/')
    || url.includes('/api/filiados/publico/')
    || url.includes('/api/cep/');
}
