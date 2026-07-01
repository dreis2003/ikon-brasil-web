import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        notification.erro('Nao foi possivel conectar ao servidor. Verifique rede, CORS ou disponibilidade do BFF.');
      } else if (error.status === 400) {
        notification.erro(mensagemErro(error) || 'Dados invalidos. Verifique as informacoes enviadas.');
      } else if (error.status === 401) {
        if (ehRequisicaoPublica(request.url)) {
          notification.erro(ehLogin(request.url) ? 'Usuario ou senha invalidos.' : 'Nao foi possivel concluir a operacao publica. Tente novamente.');
        } else {
          auth.limparSessao();
          router.navigate(['/login']);
          notification.erro('Sessao expirada. Entre novamente.');
        }
      } else if (error.status === 403) {
        notification.erro('Acesso negado. Voce nao possui permissao para executar esta acao.');
      } else if (error.status >= 500) {
        notification.erro('Falha no servidor. Tente novamente em instantes.');
      } else {
        notification.erro(mensagemErro(error) || 'Nao foi possivel concluir a operacao.');
      }
      return throwError(() => error);
    }),
  );
};

function ehLogin(url: string): boolean {
  return url.includes('/api/auth/login');
}

function ehRequisicaoPublica(url: string): boolean {
  return ehLogin(url)
    || url.includes('/api/auth/refresh')
    || url.includes('/api/filiados/publico/')
    || url.includes('/api/cep/');
}

function mensagemErro(error: HttpErrorResponse): string | null {
  if (!error.error) {
    return null;
  }
  if (typeof error.error === 'string') {
    try {
      const json = JSON.parse(error.error) as { mensagem?: string; message?: string };
      return json.mensagem || json.message || error.error;
    } catch {
      return error.error;
    }
  }
  return error.error.mensagem || error.error.message || null;
}
