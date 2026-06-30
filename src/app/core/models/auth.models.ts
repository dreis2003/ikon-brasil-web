export type PerfilUsuario = 'MATRIZ_ADMIN' | 'MATRIZ_OPERADOR' | 'FILIAL_PROFESSOR' | 'FILIAL_RESPONSAVEL';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  filialId: string | null;
  permissoes: string[];
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  usuario: UsuarioAutenticado;
}

export interface JwtPayload {
  sub: string;
  userId: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  filialId?: string;
  permissoes?: string[];
  exp: number;
}

export interface UsuarioSistema {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  perfil: PerfilUsuario;
  filialId: string | null;
  status: 'ATIVO' | 'INATIVO';
  permissoes: string[];
  dataCadastro: string;
  dataAtualizacao?: string | null;
}

export interface CriarUsuarioRequest {
  nome: string;
  email: string;
  telefone?: string | null;
  senha: string;
  perfil: PerfilUsuario;
  filialId: string | null;
}

export interface AtualizarUsuarioRequest {
  nome: string;
  email: string;
  telefone?: string | null;
  senha?: string | null;
  perfil: PerfilUsuario;
  filialId: string | null;
}
