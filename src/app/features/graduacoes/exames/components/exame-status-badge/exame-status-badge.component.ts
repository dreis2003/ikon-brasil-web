import { Component, computed, input } from '@angular/core';
import { StatusExameFaixa } from '../../models/exames-faixa.models';

const LABELS: Record<StatusExameFaixa, string> = {
  RASCUNHO: 'Rascunho',
  INSCRICOES_ABERTAS: 'Inscrições abertas',
  INSCRICOES_ENCERRADAS: 'Inscrições encerradas',
  AGUARDANDO_PAGAMENTOS: 'Aguardando pagamentos',
  CONFIRMADO: 'Confirmado',
  EM_REALIZACAO: 'Em realização',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

@Component({
  selector: 'app-exame-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="status().toLowerCase()">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 0 8px;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 820;
      white-space: nowrap;
    }
    .rascunho { background: color-mix(in srgb, var(--app-muted) 14%, transparent); color: var(--app-muted); }
    .inscricoes_abertas { background: color-mix(in srgb, #2f6fed 13%, transparent); color: #2f6fed; }
    .inscricoes_encerradas, .aguardando_pagamentos { background: color-mix(in srgb, var(--app-warning) 16%, transparent); color: var(--app-warning); }
    .confirmado, .encerrado { background: color-mix(in srgb, var(--app-success) 13%, transparent); color: var(--app-success); }
    .em_realizacao { background: color-mix(in srgb, #7c3aed 14%, transparent); color: #7c3aed; }
    .cancelado { background: color-mix(in srgb, var(--app-danger) 12%, transparent); color: var(--app-danger); }
  `],
})
export class ExameStatusBadgeComponent {
  readonly status = input.required<StatusExameFaixa>();
  readonly label = computed(() => LABELS[this.status()]);
}
