import { Component, computed, input } from '@angular/core';
import { StatusExameGraduacao } from '../../models/graduacoes-dashboard.models';

const STATUS_LABEL: Record<StatusExameGraduacao, string> = {
  PROGRAMADO: 'Programado',
  EM_AVALIACAO: 'Em Avaliação',
  EM_OBSERVACAO: 'Em Observação',
  AGUARDANDO_CERTIFICADO: 'Aguardando Certificado',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

@Component({
  selector: 'app-graduacao-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class]="status().toLowerCase()">{{ label() }}</span>`,
  styles: [`
    .status-badge {
      min-height: 24px;
      display: inline-flex;
      align-items: center;
      padding: 0 9px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 820;
      white-space: nowrap;
    }

    .programado {
      background: color-mix(in srgb, #2f6fed 13%, transparent);
      color: #2f6fed;
    }

    .em_avaliacao {
      background: color-mix(in srgb, var(--app-warning) 16%, transparent);
      color: var(--app-warning);
    }

    .em_observacao {
      background: color-mix(in srgb, var(--app-danger) 13%, transparent);
      color: var(--app-danger);
    }

    .aguardando_certificado {
      background: color-mix(in srgb, #7c3aed 14%, transparent);
      color: #7c3aed;
    }

    .finalizado {
      background: color-mix(in srgb, var(--app-success) 13%, transparent);
      color: var(--app-success);
    }

    .cancelado {
      background: color-mix(in srgb, var(--app-muted) 14%, transparent);
      color: var(--app-muted);
    }
  `],
})
export class GraduacaoStatusBadgeComponent {
  readonly status = input.required<StatusExameGraduacao>();
  readonly label = computed(() => STATUS_LABEL[this.status()]);
}
