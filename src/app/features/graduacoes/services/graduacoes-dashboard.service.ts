import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GraduacoesDashboard } from '../models/graduacoes-dashboard.models';

@Injectable({ providedIn: 'root' })
export class GraduacoesDashboardService {
  constructor(private readonly http: HttpClient) {}

  carregarDashboard(): Observable<GraduacoesDashboard> {
    return this.http.get<GraduacoesDashboard>(`${environment.apiUrl}/graduacoes/dashboard`).pipe(
      catchError(() => of(this.mockDashboard())),
    );
  }

  private mockDashboard(): GraduacoesDashboard {
    return {
      cards: [
        { chave: 'programados', titulo: 'Exames Programados', quantidade: 8, icone: 'event_available', cor: 'azul' },
        { chave: 'andamento', titulo: 'Exames em Andamento', quantidade: 2, icone: 'pending_actions', cor: 'amarelo' },
        { chave: 'pendentesCertificado', titulo: 'Exames Pendentes de Certificado', quantidade: 5, icone: 'fact_check', cor: 'roxo' },
        { chave: 'finalizados', titulo: 'Exames Finalizados', quantidade: 34, icone: 'task_alt', cor: 'verde' },
        { chave: 'observacao', titulo: 'Candidatos em Observação', quantidade: 7, icone: 'rate_review', cor: 'vermelho' },
        { chave: 'certificadosPendentes', titulo: 'Total de Certificados Pendentes', quantidade: 19, icone: 'workspace_premium', cor: 'cinza' },
      ],
      examesRecentes: [
        {
          id: '1',
          data: '2026-07-18',
          filial: 'São Paulo - Vila Mariana',
          examinador: 'Shihan Carlos Nakamura',
          quantidadeCandidatos: 26,
          status: 'PROGRAMADO',
        },
        {
          id: '2',
          data: '2026-07-12',
          filial: 'Curitiba Centro',
          examinador: 'Sensei Ricardo Almeida',
          quantidadeCandidatos: 18,
          status: 'EM_AVALIACAO',
        },
        {
          id: '3',
          data: '2026-07-06',
          filial: 'Rio de Janeiro - Tijuca',
          examinador: 'Sensei Marina Costa',
          quantidadeCandidatos: 21,
          status: 'AGUARDANDO_CERTIFICADO',
        },
        {
          id: '4',
          data: '2026-06-29',
          filial: 'Belo Horizonte',
          examinador: 'Sensei Paulo Mendes',
          quantidadeCandidatos: 14,
          status: 'EM_OBSERVACAO',
        },
        {
          id: '5',
          data: '2026-06-22',
          filial: 'Porto Alegre',
          examinador: 'Sensei Beatriz Tanaka',
          quantidadeCandidatos: 31,
          status: 'FINALIZADO',
        },
      ],
    };
  }
}
