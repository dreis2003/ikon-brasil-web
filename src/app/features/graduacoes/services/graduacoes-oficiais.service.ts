import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PUBLIC_REQUEST } from '../../../core/interceptors/public-request.context';
import { GraduacaoOficial, SalvarGraduacaoOficialRequest } from '../models/graduacao-oficial.models';

@Injectable({ providedIn: 'root' })
export class GraduacoesOficiaisService {
  private readonly baseUrl = `${environment.apiUrl}/graduacoes`;
  private readonly publicBaseUrl = `${environment.apiUrl}/bff/publico/graduacoes/graduacoes`;
  private readonly contextoPublico = new HttpContext().set(PUBLIC_REQUEST, true);
  private readonly mock = this.graduacoesIniciais();
  private usandoMock = false;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<GraduacaoOficial[]> {
    return this.http.get<GraduacaoOficial[]>(this.baseUrl).pipe(
      tap(() => this.usandoMock = false),
      catchError(() => {
        this.usandoMock = true;
        return of(this.ordenar([...this.mock]));
      }),
    );
  }

  listarPublicamente(): Observable<GraduacaoOficial[]> {
    return this.http.get<GraduacaoOficial[]>(this.publicBaseUrl, { context: this.contextoPublico }).pipe(
      catchError(() => of(this.ordenar([...this.mock]).filter((graduacao) => graduacao.ativa))),
    );
  }

  criar(request: SalvarGraduacaoOficialRequest): Observable<GraduacaoOficial> {
    if (this.usandoMock) {
      const nova: GraduacaoOficial = {
        id: crypto.randomUUID(),
        ...request,
      };
      this.mock.push(nova);
      return of(nova);
    }
    return this.http.post<GraduacaoOficial>(this.baseUrl, request);
  }

  atualizar(id: string, request: SalvarGraduacaoOficialRequest): Observable<GraduacaoOficial> {
    if (this.usandoMock) {
      const indice = this.mock.findIndex((graduacao) => graduacao.id === id);
      const atualizada: GraduacaoOficial = { id, ...request };
      if (indice >= 0) {
        this.mock[indice] = atualizada;
      }
      return of(atualizada);
    }
    return this.http.put<GraduacaoOficial>(`${this.baseUrl}/${id}`, request);
  }

  ativar(id: string): Observable<GraduacaoOficial> {
    return this.alterarAtivo(id, true);
  }

  inativar(id: string): Observable<GraduacaoOficial> {
    return this.alterarAtivo(id, false);
  }

  private alterarAtivo(id: string, ativa: boolean): Observable<GraduacaoOficial> {
    if (this.usandoMock) {
      const graduacao = this.mock.find((item) => item.id === id);
      if (graduacao) {
        graduacao.ativa = ativa;
      }
      return of(graduacao as GraduacaoOficial);
    }

    return this.http.patch<GraduacaoOficial>(`${this.baseUrl}/${id}/${ativa ? 'ativar' : 'inativar'}`, {}).pipe(
      catchError(() => this.listar().pipe(
        map((graduacoes) => graduacoes.find((graduacao) => graduacao.id === id) as GraduacaoOficial),
      )),
    );
  }

  private ordenar(graduacoes: GraduacaoOficial[]): GraduacaoOficial[] {
    return graduacoes.sort((a, b) => a.ordemTecnica - b.ordemTecnica);
  }

  private graduacoesIniciais(): GraduacaoOficial[] {
    return [
      ['00000000-0000-0000-0000-000000000001', '11º Kyu - Faixa Branca', 'BRANCA', 11, null, 'KYU', 1, 1, false],
      ['00000000-0000-0000-0000-000000000002', '11º Kyu - Faixa Vermelha Infantil', 'VERMELHA', 11, null, 'KYU', 1, 2, true],
      ['00000000-0000-0000-0000-000000000003', '10º Kyu - Faixa Laranja', 'LARANJA', 10, null, 'KYU', 2, 3, false],
      ['00000000-0000-0000-0000-000000000004', '9º Kyu - Faixa Laranja', 'LARANJA', 9, null, 'KYU', 2, 4, false],
      ['00000000-0000-0000-0000-000000000005', '8º Kyu - Faixa Azul', 'AZUL', 8, null, 'KYU', 3, 5, false],
      ['00000000-0000-0000-0000-000000000006', '7º Kyu - Faixa Azul', 'AZUL', 7, null, 'KYU', 3, 6, false],
      ['00000000-0000-0000-0000-000000000007', '6º Kyu - Faixa Amarela', 'AMARELA', 6, null, 'KYU', 4, 7, false],
      ['00000000-0000-0000-0000-000000000008', '5º Kyu - Faixa Amarela', 'AMARELA', 5, null, 'KYU', 4, 8, false],
      ['00000000-0000-0000-0000-000000000009', '4º Kyu - Faixa Verde', 'VERDE', 4, null, 'KYU', 5, 9, false],
      ['00000000-0000-0000-0000-000000000010', '3º Kyu - Faixa Verde', 'VERDE', 3, null, 'KYU', 5, 10, false],
      ['00000000-0000-0000-0000-000000000011', '2º Kyu - Faixa Marrom', 'MARROM', 2, null, 'KYU', 6, 11, false],
      ['00000000-0000-0000-0000-000000000012', '1º Kyu - Faixa Marrom', 'MARROM', 1, null, 'KYU', 6, 12, false],
      ['00000000-0000-0000-0000-000000000013', '1º Dan - Faixa Preta', 'PRETA', null, 1, 'DAN', 7, 13, false],
      ['00000000-0000-0000-0000-000000000014', '2º Dan - Faixa Preta', 'PRETA', null, 2, 'DAN', 7, 14, false],
      ['00000000-0000-0000-0000-000000000015', '3º Dan - Faixa Preta', 'PRETA', null, 3, 'DAN', 7, 15, false],
      ['00000000-0000-0000-0000-000000000016', '4º Dan - Faixa Preta', 'PRETA', null, 4, 'DAN', 7, 16, false],
      ['00000000-0000-0000-0000-000000000017', '5º Dan - Faixa Preta', 'PRETA', null, 5, 'DAN', 7, 17, false],
      ['00000000-0000-0000-0000-000000000018', '6º Dan - Faixa Preta', 'PRETA', null, 6, 'DAN', 7, 18, false],
      ['00000000-0000-0000-0000-000000000019', '7º Dan - Faixa Preta', 'PRETA', null, 7, 'DAN', 7, 19, false],
      ['00000000-0000-0000-0000-000000000020', '8º Dan - Faixa Preta', 'PRETA', null, 8, 'DAN', 7, 20, false],
      ['00000000-0000-0000-0000-000000000021', '9º Dan - Faixa Preta', 'PRETA', null, 9, 'DAN', 7, 21, false],
    ].map(([id, nome, corFaixa, kyu, dan, tipo, ordemCor, ordemTecnica, infantil]) => ({
      id: id as string,
      nome: nome as string,
      corFaixa: corFaixa as string,
      kyu: kyu as number | null,
      dan: dan as number | null,
      tipo: tipo as 'KYU' | 'DAN',
      ordemCor: ordemCor as number,
      ordemTecnica: ordemTecnica as number,
      infantil: infantil as boolean,
      ativa: true,
    }));
  }
}
