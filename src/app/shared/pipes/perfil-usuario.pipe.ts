import { Pipe, PipeTransform } from '@angular/core';
import { PerfilUsuario } from '../../core/models/auth.models';

const PERFIS: Record<PerfilUsuario, string> = {
  MATRIZ_ADMIN: 'Administrador da Matriz',
  MATRIZ_OPERADOR: 'Operador da Matriz',
  FILIAL_PROFESSOR: 'Professor de Filial',
  FILIAL_RESPONSAVEL: 'Responsavel de Filial',
};

@Pipe({
  name: 'perfilUsuario',
  standalone: true,
})
export class PerfilUsuarioPipe implements PipeTransform {
  transform(perfil: PerfilUsuario | string | null | undefined): string {
    if (!perfil) {
      return '-';
    }

    return PERFIS[perfil as PerfilUsuario] ?? perfil;
  }
}
