import { Component, input } from '@angular/core';
import { GraduacoesResumoCard } from '../../models/graduacoes-dashboard.models';

@Component({
  selector: 'app-dashboard-stat-card',
  standalone: true,
  template: `
    <button class="stat-card" type="button" [class]="card().cor" [attr.aria-label]="card().titulo">
      <span class="icon-wrap">
        <span class="material-symbols-outlined">{{ card().icone }}</span>
      </span>
      <span class="stat-copy">
        <strong>{{ card().quantidade }}</strong>
        <span>{{ card().titulo }}</span>
      </span>
    </button>
  `,
  styleUrl: './dashboard-stat-card.component.scss',
})
export class DashboardStatCardComponent {
  readonly card = input.required<GraduacoesResumoCard>();
}
