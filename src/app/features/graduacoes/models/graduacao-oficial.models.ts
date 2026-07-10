export type TipoGraduacao = 'KYU' | 'DAN';

export interface GraduacaoOficial {
  id: string;
  nome: string;
  corFaixa: string;
  kyu: number | null;
  dan: number | null;
  tipo: TipoGraduacao;
  ordemCor: number;
  ordemTecnica: number;
  infantil: boolean;
  ativa: boolean;
}

export interface SalvarGraduacaoOficialRequest {
  nome: string;
  corFaixa: string;
  kyu: number | null;
  dan: number | null;
  tipo: TipoGraduacao;
  ordemCor: number;
  ordemTecnica: number;
  infantil: boolean;
  ativa: boolean;
}
