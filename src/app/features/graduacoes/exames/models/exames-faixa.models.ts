export type StatusExameFaixa =
  | 'RASCUNHO'
  | 'INSCRICOES_ABERTAS'
  | 'INSCRICOES_ENCERRADAS'
  | 'AGUARDANDO_PAGAMENTOS'
  | 'CONFIRMADO'
  | 'EM_REALIZACAO'
  | 'ENCERRADO'
  | 'CANCELADO';

export type StatusCandidatoExame =
  | 'INSCRITO'
  | 'PAGAMENTO_PENDENTE'
  | 'PAGAMENTO_CONFIRMADO'
  | 'CONFIRMADO_NO_EXAME'
  | 'CANCELADO';

export interface ExameFaixa {
  id: string;
  filialId: string;
  nome: string;
  dataAberturaInscricoes: string;
  dataFinalInscricao: string;
  dataFinalPagamentoInscricao: string;
  dataExame: string;
  dataFinalPagamentoFaixaCertificado: string;
  examinadorId: string;
  local: string | null;
  horarioInicio: string | null;
  status: StatusExameFaixa;
  tokenPublico: string | null;
  observacoes: string | null;
  dataCadastro: string;
}

export interface CandidatoExame {
  id: string;
  exameFaixaId: string;
  filiadoId: string;
  nomeFiliado?: string | null;
  cpfFiliado?: string | null;
  numeroInternacional?: string | null;
  graduacaoAtualId: string;
  graduacaoAtualNome?: string | null;
  graduacaoPretendidaId: string;
  graduacaoPretendidaNome?: string | null;
  tamanhoFaixa: string;
  status: StatusCandidatoExame;
  peso: number | null;
  altura: number | null;
  nomeResponsavel: string | null;
  origemInscricao: 'MANUAL' | 'PUBLICA' | null;
  dataInscricao: string | null;
  dataConfirmacaoPagamento: string | null;
}

export interface SalvarExameFaixaRequest {
  filialId: string;
  nome: string;
  dataAberturaInscricoes: string;
  dataFinalInscricao: string;
  dataFinalPagamentoInscricao: string;
  dataExame: string;
  dataFinalPagamentoFaixaCertificado: string;
  examinadorId: string;
  local: string;
  horarioInicio: string;
  observacoes: string | null;
}

export interface AdicionarCandidatoRequest {
  filiadoId: string;
  graduacaoPretendidaId: string;
  tamanhoFaixa: string;
  peso: number | null;
  altura: number | null;
  nomeResponsavel: string | null;
}

export interface ValidarCpfInscricaoResponse {
  id: string;
  cpf?: string | null;
  nome: string;
  dataNascimento: string | null;
  filialId: string;
  numeroInternacional?: string | null;
  graduacaoAtualId?: string | null;
  graduacaoAtualNome?: string | null;
}

export interface InscricaoPublicaRequest {
  cpf: string;
  graduacaoPretendidaId: string;
  tamanhoFaixa: string;
  nomeResponsavel: string | null;
  peso: number | null;
  altura: number | null;
  aceiteTermo: boolean;
}
