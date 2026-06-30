import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CriarFilialRequest, Filial } from '../models/cadastro.models';

@Injectable({ providedIn: 'root' })
export class FiliaisService {
  private readonly baseUrl = `${environment.bffUrl}/api/filiais`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Filial[]> {
    return this.http.get<Filial[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<Filial> {
    return this.http.get<Filial>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarFilialRequest): Observable<Filial> {
    return this.http.post<Filial>(this.baseUrl, request);
  }

  atualizar(id: string, request: CriarFilialRequest): Observable<Filial> {
    return this.http.put<Filial>(`${this.baseUrl}/${id}`, request);
  }

  ativar(id: string): Observable<Filial> {
    return this.http.patch<Filial>(`${this.baseUrl}/${id}/ativar`, {});
  }

  inativar(id: string): Observable<Filial> {
    return this.http.patch<Filial>(`${this.baseUrl}/${id}/inativar`, {});
  }
}
