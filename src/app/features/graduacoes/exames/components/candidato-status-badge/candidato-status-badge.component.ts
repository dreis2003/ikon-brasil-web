import { Component, computed, input } from '@angular/core';
import { StatusCandidatoExame } from '../../models/exames-faixa.models';

const LABELS: Record<StatusCandidatoExame, string> = {
  INSCRITO: 'Inscrito',
  PAGAMENTO_PENDENTE: 'Pagamento pendente',
  PAGAMENTO_CONFIRMADO: 'Pagamento confirmado',
  CONFIRMADO_NO_EXAME: 'Confirmado no exame',
  CANCELADO: 'Cancelado',
};

@Component({
  selector: 'app-candidato-status-badge',
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
    .inscrito, .pagamento_pendente { background: color-mix(in srgb, var(--app-warning) 16%, transparent); color: var(--app-warning); }
    .pagamento_confirmado, .confirmado_no_exame { background: color-mix(in srgb, var(--app-success) 13%, transparent); color: var(--app-success); }
    .cancelado { background: color-mix(in srgb, var(--app-danger) 12%, transparent); color: var(--app-danger); }
  `],
})
export class CandidatoStatusBadgeComponent {
  readonly status = input.required<StatusCandidatoExame>();
  readonly label = computed(() => LABELS[this.status()]);
}
