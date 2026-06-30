import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Filiado, FiliadoRequest } from '../models/cadastro.models';

@Injectable({ providedIn: 'root' })
export class FiliadosService {
  private readonly baseUrl = `${environment.bffUrl}/api/filiados`;

  constructor(private readonly http: HttpClient) {}

  listar(filialId?: string | null): Observable<Filiado[]> {
    const params = filialId ? new HttpParams().set('filialId', filialId) : undefined;
    return this.http.get<Filiado[]>(this.baseUrl, { params });
  }

  listarPendentes(filialId?: string | null): Observable<Filiado[]> {
    const params = filialId ? new HttpParams().set('filialId', filialId) : undefined;
    return this.http.get<Filiado[]>(`${this.baseUrl}/pendentes`, { params });
  }

  buscarPorId(id: string): Observable<Filiado> {
    return this.http.get<Filiado>(`${this.baseUrl}/${id}`);
  }

  criar(request: FiliadoRequest): Observable<Filiado> {
    return this.http.post<Filiado>(this.baseUrl, request);
  }

  autocadastrar(filialId: string, request: FiliadoRequest): Observable<Filiado> {
    return this.http.post<Filiado>(`${this.baseUrl}/publico/filiais/${filialId}/autocadastro`, request);
  }

  atualizar(id: string, request: FiliadoRequest): Observable<Filiado> {
    return this.http.put<Filiado>(`${this.baseUrl}/${id}`, request);
  }

  atualizarFoto(id: string, fotoPerfilUrl: string): Observable<Filiado> {
    return this.http.patch<Filiado>(`${this.baseUrl}/${id}/foto-perfil`, { fotoPerfilUrl });
  }

  ativar(id: string): Observable<Filiado> {
    return this.http.patch<Filiado>(`${this.baseUrl}/${id}/ativar`, {});
  }

  aprovar(id: string): Observable<Filiado> {
    return this.http.patch<Filiado>(`${this.baseUrl}/${id}/aprovar`, {});
  }

  inativar(id: string): Observable<Filiado> {
    return this.http.patch<Filiado>(`${this.baseUrl}/${id}/inativar`, {});
  }
}
