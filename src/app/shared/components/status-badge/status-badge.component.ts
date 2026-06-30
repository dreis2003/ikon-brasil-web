import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class.inactive]="status() === 'INATIVO' || status() === 'INATIVA'" [class.pending]="status() === 'PENDENTE_APROVACAO'">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 0 9px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--app-success) 12%, transparent);
      color: var(--app-success);
      font-size: 0.74rem;
      font-weight: 800;
    }

    .badge.inactive {
      background: color-mix(in srgb, var(--app-danger) 12%, transparent);
      color: var(--app-danger);
    }

    .badge.pending {
      background: color-mix(in srgb, #b7791f 14%, transparent);
      color: #b7791f;
    }
  `],
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();

  label(): string {
    return this.status() === 'PENDENTE_APROVACAO' ? 'PENDENTE' : this.status();
  }
}
