import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AtualizarUsuarioRequest, CriarUsuarioRequest, UsuarioSistema } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<UsuarioSistema[]> {
    return this.http.get<UsuarioSistema[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<UsuarioSistema> {
    return this.http.get<UsuarioSistema>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarUsuarioRequest): Observable<UsuarioSistema> {
    return this.http.post<UsuarioSistema>(this.baseUrl, request);
  }

  atualizar(id: string, request: AtualizarUsuarioRequest): Observable<UsuarioSistema> {
    return this.http.put<UsuarioSistema>(`${this.baseUrl}/${id}`, request);
  }

  ativar(id: string): Observable<UsuarioSistema> {
    return this.http.patch<UsuarioSistema>(`${this.baseUrl}/${id}/ativar`, {});
  }

  inativar(id: string): Observable<UsuarioSistema> {
    return this.http.patch<UsuarioSistema>(`${this.baseUrl}/${id}/inativar`, {});
  }
}
