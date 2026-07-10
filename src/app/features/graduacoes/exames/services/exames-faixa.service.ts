import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdicionarCandidatoRequest, CandidatoExame, ExameFaixa, SalvarExameFaixaRequest } from '../models/exames-faixa.models';

@Injectable({ providedIn: 'root' })
export class ExamesFaixaService {
  private readonly baseUrl = `${environment.apiUrl}/bff/graduacoes/exames`;
  private usandoMock = false;
  private readonly examesMock: ExameFaixa[] = [
    {
      id: 'mock-1',
      filialId: 'filial-1',
      nome: '3º Exame de Faixas Coloridas - Filial Santo André',
      dataAberturaInscricoes: '2026-07-01',
      dataFinalInscricao: '2026-07-20',
      dataFinalPagamentoInscricao: '2026-07-22',
      dataExame: '2026-07-27',
      dataFinalPagamentoFaixaCertificado: '2026-08-10',
      examinadorId: 'examinador-1',
      local: 'Dojo Santo André',
      horarioInicio: '09:00',
      status: 'INSCRICOES_ABERTAS',
      tokenPublico: null,
      observacoes: 'Chegar com 30 minutos de antecedência.',
      dataCadastro: new Date().toISOString(),
    },
  ];
  private readonly candidatosMock: Record<string, CandidatoExame[]> = {
    'mock-1': [
      {
        id: 'cand-1',
        exameFaixaId: 'mock-1',
        filiadoId: 'filiado-1',
        nomeFiliado: 'Filiado de Demonstração',
        cpfFiliado: '123.456.789-00',
        numeroInternacional: 'IKO-000123',
        graduacaoAtualId: '00000000-0000-0000-0000-000000000001',
        graduacaoAtualNome: '11º Kyu - Faixa Branca',
        graduacaoPretendidaId: '00000000-0000-0000-0000-000000000003',
        graduacaoPretendidaNome: '10º Kyu - Faixa Laranja',
        tamanhoFaixa: 'A2',
        status: 'PAGAMENTO_PENDENTE',
        peso: 72,
        altura: 1.76,
        nomeResponsavel: null,
        origemInscricao: 'PUBLICA',
        dataInscricao: new Date().toISOString(),
        dataConfirmacaoPagamento: null,
      },
    ],
  };

  constructor(private readonly http: HttpClient) {}

  listar(filialId?: string): Observable<ExameFaixa[]> {
    const params = filialId ? new HttpParams().set('filialId', filialId) : undefined;
    return this.http.get<ExameFaixa[]>(this.baseUrl, { params }).pipe(
      tap(() => this.usandoMock = false),
      catchError(() => {
        this.usandoMock = true;
        return of([...this.examesMock]);
      }),
    );
  }

  buscar(id: string): Observable<ExameFaixa> {
    if (this.usandoMock) {
      return of(this.examesMock.find((exame) => exame.id === id) ?? this.examesMock[0]);
    }
    return this.http.get<ExameFaixa>(`${this.baseUrl}/${id}`);
  }

  criar(request: SalvarExameFaixaRequest): Observable<ExameFaixa> {
    if (this.usandoMock) {
      const exame: ExameFaixa = {
        id: crypto.randomUUID(),
        ...request,
        status: 'RASCUNHO',
        tokenPublico: crypto.randomUUID(),
        dataCadastro: new Date().toISOString(),
      };
      this.examesMock.unshift(exame);
      return of(exame);
    }
    return this.http.post<ExameFaixa>(this.baseUrl, request);
  }

  atualizar(id: string, request: SalvarExameFaixaRequest): Observable<ExameFaixa> {
    if (this.usandoMock) {
      const atual = this.examesMock.find((exame) => exame.id === id) ?? this.examesMock[0];
      Object.assign(atual, request);
      return of(atual);
    }
    return this.http.put<ExameFaixa>(`${this.baseUrl}/${id}`, request);
  }

  alterarStatus(exameId: string, status: ExameFaixa['status']): Observable<ExameFaixa> {
    if (this.ehIdMock(exameId)) {
      const exame = this.examesMock.find((item) => item.id === exameId) ?? this.examesMock[0];
      exame.status = status;
      return of(exame);
    }
    return this.http.patch<ExameFaixa>(`${this.baseUrl}/${exameId}/status`, { status });
  }

  listarCandidatos(exameId: string): Observable<CandidatoExame[]> {
    if (this.usandoMock) {
      return of(this.candidatosMock[exameId] ?? []);
    }
    return this.http.get<CandidatoExame[]>(`${this.baseUrl}/${exameId}/candidatos`).pipe(
      catchError(() => of(this.candidatosMock[exameId] ?? [])),
    );
  }

  adicionarCandidato(exameId: string, request: AdicionarCandidatoRequest): Observable<CandidatoExame> {
    if (this.usandoMock) {
      const candidato: CandidatoExame = {
        id: crypto.randomUUID(),
        exameFaixaId: exameId,
        filiadoId: request.filiadoId,
        nomeFiliado: request.filiadoId,
        cpfFiliado: null,
        numeroInternacional: null,
        graduacaoAtualId: '00000000-0000-0000-0000-000000000001',
        graduacaoAtualNome: '11º Kyu - Faixa Branca',
        graduacaoPretendidaId: request.graduacaoPretendidaId,
        graduacaoPretendidaNome: null,
        tamanhoFaixa: request.tamanhoFaixa,
        status: 'PAGAMENTO_PENDENTE',
        peso: request.peso,
        altura: request.altura,
        nomeResponsavel: request.nomeResponsavel,
        origemInscricao: 'MANUAL',
        dataInscricao: new Date().toISOString(),
        dataConfirmacaoPagamento: null,
      };
      this.candidatosMock[exameId] = [...(this.candidatosMock[exameId] ?? []), candidato];
      return of(candidato);
    }
    return this.http.post<CandidatoExame>(`${this.baseUrl}/${exameId}/candidatos`, request);
  }

  confirmarPagamento(exameId: string, candidatoId: string): Observable<CandidatoExame> {
    if (this.usandoMock) {
      const candidato = (this.candidatosMock[exameId] ?? []).find((item) => item.id === candidatoId) as CandidatoExame;
      candidato.status = 'PAGAMENTO_CONFIRMADO';
      candidato.dataConfirmacaoPagamento = new Date().toISOString();
      return of(candidato);
    }
    return this.http.post<CandidatoExame>(`${this.baseUrl}/${exameId}/candidatos/${candidatoId}/confirmar-pagamento`, {});
  }

  cancelarCandidato(exameId: string, candidatoId: string): Observable<void> {
    if (this.usandoMock) {
      const candidato = (this.candidatosMock[exameId] ?? []).find((item) => item.id === candidatoId);
      if (candidato) {
        candidato.status = 'CANCELADO';
      }
      return of(void 0);
    }
    return this.http.delete<void>(`${this.baseUrl}/${exameId}/candidatos/${candidatoId}`);
  }

  linkPublico(exameId: string): Observable<{ tokenPublico: string }> {
    if (this.ehIdMock(exameId)) {
      return of({ tokenPublico: '' });
    }
    return this.http.get<{ tokenPublico: string }>(`${this.baseUrl}/${exameId}/link-publico`).pipe(
      catchError((erro) => throwError(() => erro)),
    );
  }

  private ehIdMock(id: string): boolean {
    return id.startsWith('mock-');
  }
}
