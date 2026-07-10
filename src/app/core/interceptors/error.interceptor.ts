import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';
import { PUBLIC_REQUEST } from './public-request.context';

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
        if (request.context.get(PUBLIC_REQUEST) || ehRequisicaoPublica(request.url)) {
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
    || url.includes('/api/bff/publico/graduacoes/')
    || url.includes('/api/filiados/publico/')
    || url.includes('/api/cep/');
}

function mensagemErro(error: HttpErrorResponse): string | null {
  if (!error.error) {
    return null;
  }
  if (typeof error.error === 'string') {
    try {
      const json = JSON.parse(error.error) as { mensagem?: string; message?: string; mensagens?: string[] };
      return formatarMensagemErro(json) || error.error;
    } catch {
      return error.error;
    }
  }
  return formatarMensagemErro(error.error);
}

function formatarMensagemErro(error: { mensagem?: string; message?: string; mensagens?: string[] }): string | null {
  if (Array.isArray(error.mensagens) && error.mensagens.length > 0) {
    return error.mensagens.join(' ');
  }
  return error.mensagem || error.message || null;
}
