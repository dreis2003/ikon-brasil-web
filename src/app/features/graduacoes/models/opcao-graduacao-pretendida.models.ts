import { GraduacaoOficial } from './graduacao-oficial.models';

export interface OpcaoGraduacaoPretendida {
  id: string;
  label: string;
  graduacao: GraduacaoOficial;
}

export function montarOpcoesGraduacaoPretendida(
  graduacoes: GraduacaoOficial[],
  dataNascimento?: string | null,
): OpcaoGraduacaoPretendida[] {
  const permiteInfantil = dataNascimento ? idade(dataNascimento) <= 7 : false;
  const ativas = [...graduacoes]
    .filter((graduacao) => graduacao.ativa)
    .sort((a, b) => a.ordemTecnica - b.ordemTecnica);

  return ativas
    .filter((graduacao) => deveExibir(graduacao, permiteInfantil))
    .map((graduacao) => ({
      id: graduacao.id,
      label: label(graduacao),
      graduacao,
    }));
}

function deveExibir(graduacao: GraduacaoOficial, permiteInfantil: boolean): boolean {
  if (graduacao.infantil) {
    return permiteInfantil;
  }
  if (graduacao.tipo === 'DAN') {
    return true;
  }
  if (graduacao.corFaixa === 'BRANCA') {
    return false;
  }
  if (graduacao.corFaixa === 'MARROM') {
    return graduacao.kyu === 2 || graduacao.kyu === 1;
  }
  return ['LARANJA', 'AZUL', 'AMARELA', 'VERDE'].includes(graduacao.corFaixa)
    && [10, 8, 6, 4].includes(graduacao.kyu ?? 0);
}

function label(graduacao: GraduacaoOficial): string {
  if (graduacao.tipo === 'DAN') {
    return `${graduacao.dan}º Dan - Faixa Preta`;
  }
  if (graduacao.corFaixa === 'MARROM') {
    return `Faixa Marrom ${graduacao.kyu}º Kyu`;
  }
  if (graduacao.infantil) {
    return 'Faixa Vermelha Infantil';
  }
  return `Faixa ${capitalizar(graduacao.corFaixa)}`;
}

function capitalizar(valor: string): string {
  return valor.toLocaleLowerCase('pt-BR').replace(/^./, (letra) => letra.toLocaleUpperCase('pt-BR'));
}

function idade(dataNascimento: string): number {
  const nascimento = new Date(`${dataNascimento}T00:00:00`);
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    anos -= 1;
  }
  return anos;
}
