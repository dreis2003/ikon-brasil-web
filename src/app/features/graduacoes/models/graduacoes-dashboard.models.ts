export type StatusExameGraduacao =
  | 'PROGRAMADO'
  | 'EM_AVALIACAO'
  | 'EM_OBSERVACAO'
  | 'AGUARDANDO_CERTIFICADO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface GraduacoesResumoCard {
  chave: string;
  titulo: string;
  quantidade: number;
  icone: string;
  cor: 'azul' | 'verde' | 'amarelo' | 'vermelho' | 'roxo' | 'cinza';
}

export interface ExameGraduacaoResumo {
  id: string;
  data: string;
  filial: string;
  examinador: string;
  quantidadeCandidatos: number;
  status: StatusExameGraduacao;
}

export interface GraduacoesDashboard {
  cards: GraduacoesResumoCard[];
  examesRecentes: ExameGraduacaoResumo[];
}
