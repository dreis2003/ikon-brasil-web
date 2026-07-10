import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PUBLIC_REQUEST } from '../../../../core/interceptors/public-request.context';
import { CandidatoExame, ExameFaixa, InscricaoPublicaRequest, ValidarCpfInscricaoResponse } from '../models/exames-faixa.models';

@Injectable({ providedIn: 'root' })
export class InscricaoPublicaExameService {
  private readonly baseUrl = `${environment.apiUrl}/bff/publico/graduacoes/exames`;
  private readonly contextoPublico = new HttpContext().set(PUBLIC_REQUEST, true);

  constructor(private readonly http: HttpClient) {}

  consultarExame(token: string): Observable<ExameFaixa> {
    return this.http.get<ExameFaixa>(`${this.baseUrl}/${token}`, { context: this.contextoPublico });
  }

  validarCpf(token: string, cpf: string): Observable<ValidarCpfInscricaoResponse> {
    return this.http.post<ValidarCpfInscricaoResponse>(`${this.baseUrl}/${token}/validar-cpf`, { cpf }, { context: this.contextoPublico });
  }

  inscrever(token: string, request: InscricaoPublicaRequest): Observable<CandidatoExame> {
    return this.http.post<CandidatoExame>(`${this.baseUrl}/${token}/inscrever`, request, { context: this.contextoPublico });
  }
}
