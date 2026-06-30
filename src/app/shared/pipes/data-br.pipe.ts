import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataBr',
  standalone: true,
})
export class DataBrPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) {
      return '-';
    }

    const data = valor.split('T')[0];
    const partes = data.split('-');
    if (partes.length !== 3) {
      return valor;
    }

    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
}
