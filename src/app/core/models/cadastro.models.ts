export type StatusFilial = 'ATIVA' | 'INATIVA';
export type StatusFiliado = 'ATIVO' | 'INATIVO' | 'PENDENTE_APROVACAO';
export type Sexo = 'FEMININO' | 'MASCULINO' | 'NAO_INFORMADO';
export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Filial {
  id: string;
  nome: string;
  codigo: string;
  responsavel?: string | null;
  logoUrl?: string | null;
  emailResponsavel?: string | null;
  telefone?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade: string;
  estado: string;
  cep?: string | null;
  status: StatusFilial;
  dataCadastro: string;
  dataAtualizacao?: string | null;
}

export interface CriarFilialRequest {
  nome: string;
  codigo: string;
  responsavel?: string | null;
  logoUrl?: string | null;
  emailResponsavel?: string | null;
  telefone?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade: string;
  estado: string;
  cep?: string | null;
}

export interface Endereco {
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export interface Filiado {
  id: string;
  nomeCompleto: string;
  nomeSocial?: string | null;
  dataNascimento: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  sexo: Sexo;
  alturaCm?: number | null;
  pesoKg?: number | null;
  tipoSanguineo?: TipoSanguineo | null;
  dataInicioTreinamento?: string | null;
  nacionalidade?: string | null;
  naturalidade?: string | null;
  profissao?: string | null;
  responsavelNome?: string | null;
  responsavelParentesco?: string | null;
  responsavelCpf?: string | null;
  responsavelTelefone?: string | null;
  responsavelEmail?: string | null;
  dadosMedicos?: string | null;
  parqPergunta1?: boolean | null;
  parqPergunta2?: boolean | null;
  parqPergunta3?: boolean | null;
  parqPergunta4?: boolean | null;
  parqPergunta5?: boolean | null;
  parqPergunta6?: boolean | null;
  parqPergunta7?: boolean | null;
  assinaturaNome?: string | null;
  declaracaoSaudeAceite?: boolean | null;
  declaracaoSaudeAceiteEm?: string | null;
  declaracaoSaudeAceiteIp?: string | null;
  numeroInternacional?: string | null;
  status: StatusFiliado;
  fotoPerfilUrl?: string | null;
  endereco?: Endereco | null;
  filialId: string;
  dataCadastro: string;
  dataAtualizacao?: string | null;
}

export interface FiliadoRequest {
  nomeCompleto: string;
  nomeSocial?: string | null;
  dataNascimento: string;
  cpf?: string | null;
  rg?: string | null;
  email?: string | null;
  telefone?: string | null;
  sexo?: Sexo | null;
  alturaCm?: number | null;
  pesoKg?: number | null;
  tipoSanguineo?: TipoSanguineo | null;
  dataInicioTreinamento?: string | null;
  nacionalidade?: string | null;
  naturalidade?: string | null;
  profissao?: string | null;
  responsavelNome?: string | null;
  responsavelParentesco?: string | null;
  responsavelCpf?: string | null;
  responsavelTelefone?: string | null;
  responsavelEmail?: string | null;
  dadosMedicos?: string | null;
  parqPergunta1?: boolean | null;
  parqPergunta2?: boolean | null;
  parqPergunta3?: boolean | null;
  parqPergunta4?: boolean | null;
  parqPergunta5?: boolean | null;
  parqPergunta6?: boolean | null;
  parqPergunta7?: boolean | null;
  assinaturaNome?: string | null;
  declaracaoSaudeAceite: boolean;
  endereco?: Endereco | null;
  numeroInternacional?: string | null;
  fotoPerfilUrl?: string | null;
  filialId: string;
}
