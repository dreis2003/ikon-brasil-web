import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtPayload, LoginRequest, TokenResponse, UsuarioAutenticado } from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'ikon.accessToken';
const REFRESH_TOKEN_KEY = 'ikon.refreshToken';
const USER_KEY = 'ikon.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioSignal = signal<UsuarioAutenticado | null>(this.carregarUsuario());
  private readonly accessTokenSignal = signal<string | null>(sessionStorage.getItem(ACCESS_TOKEN_KEY));
  private readonly refreshTokenSignal = signal<string | null>(sessionStorage.getItem(REFRESH_TOKEN_KEY));

  readonly usuario = this.usuarioSignal.asReadonly();
  readonly autenticado = computed(() => !!this.accessTokenSignal() && !this.tokenExpirado(this.accessTokenSignal()));

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.bffUrl}/api/auth/login`, request).pipe(
      tap((response) => this.salvarSessao(response)),
    );
  }

  logout(): void {
    const refreshToken = this.refreshTokenSignal();
    this.limparSessao();
    if (refreshToken) {
      this.http.post(`${environment.bffUrl}/api/auth/logout`, { refreshToken }).pipe(catchError(() => throwError(() => null))).subscribe();
    }
    this.router.navigate(['/login']);
  }

  accessToken(): string | null {
    return this.accessTokenSignal();
  }

  refreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  possuiPerfil(perfis: string[]): boolean {
    const usuario = this.usuarioSignal();
    return !!usuario && perfis.includes(usuario.perfil);
  }

  possuiPermissao(permissoes: string[]): boolean {
    const usuario = this.usuarioSignal();
    if (!usuario) {
      return false;
    }
    if (usuario.perfil === 'MATRIZ_ADMIN') {
      return true;
    }
    return permissoes.some((permissao) => usuario.permissoes.includes(permissao));
  }

  sincronizarUsuarioPeloToken(token: string): void {
    const payload = this.decodificarJwt(token);
    if (!payload) {
      return;
    }
    const usuario: UsuarioAutenticado = {
      id: payload.userId,
      nome: payload.nome,
      email: payload.email,
      perfil: payload.perfil,
      filialId: payload.filialId || null,
      permissoes: payload.permissoes ?? [],
    };
    this.usuarioSignal.set(usuario);
    sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }

  limparSessao(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.usuarioSignal.set(null);
  }

  private salvarSessao(response: TokenResponse): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.usuario));
    this.accessTokenSignal.set(response.accessToken);
    this.refreshTokenSignal.set(response.refreshToken);
    this.usuarioSignal.set(response.usuario);
  }

  private carregarUsuario(): UsuarioAutenticado | null {
    const json = sessionStorage.getItem(USER_KEY);
    if (!json) {
      return null;
    }
    try {
      return JSON.parse(json) as UsuarioAutenticado;
    } catch {
      return null;
    }
  }

  private tokenExpirado(token: string | null): boolean {
    const payload = token ? this.decodificarJwt(token) : null;
    if (!payload?.exp) {
      return true;
    }
    return payload.exp * 1000 <= Date.now();
  }

  private decodificarJwt(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
