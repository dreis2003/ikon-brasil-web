import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { AuthService } from '../../../../../core/auth/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ExameStatusBadgeComponent } from '../../components/exame-status-badge/exame-status-badge.component';
import { ExameFaixa, StatusExameFaixa } from '../../models/exames-faixa.models';
import { ExamesFaixaService } from '../../services/exames-faixa.service';

@Component({
  selector: 'app-exames-faixa-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ExameStatusBadgeComponent,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Exames de Faixa</h1>
          <p class="page-subtitle">Programação, inscrições e pagamentos dos exames de graduação.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/app/graduacoes/exames/novo">
          <span class="material-symbols-outlined">add</span>
          Novo Exame de Faixa
        </a>
      </header>

      <section class="panel filters">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="statusControl">
            <mat-option value="">Todos</mat-option>
            @for (status of statusOptions; track status.value) {
              <mat-option [value]="status.value">{{ status.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Período</mat-label>
          <mat-select [formControl]="periodoControl">
            <mat-option value="30">30 dias</mat-option>
            <mat-option value="90">90 dias</mat-option>
            <mat-option value="180">180 dias</mat-option>
            <mat-option value="todos">Todos</mat-option>
          </mat-select>
        </mat-form-field>

        @if (ehHonbu()) {
          <mat-form-field appearance="outline">
            <mat-label>Filial</mat-label>
            <mat-select [formControl]="filialControl">
              <mat-option value="">Todas</mat-option>
              @for (filial of filiais(); track filial) {
                <mat-option [value]="filial">{{ filial }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>Pesquisa rápida</mat-label>
          <input matInput [formControl]="pesquisaControl" placeholder="Nome, local ou status" />
          <span matSuffix class="material-symbols-outlined">search</span>
        </mat-form-field>
      </section>

      <div class="panel table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Exame</th>
              <th>Local</th>
              <th>Status</th>
              <th class="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (exame of examesFiltrados(); track exame.id) {
              <tr>
                <td><strong>{{ exame.dataExame | date:'dd/MM/yyyy' }}</strong></td>
                <td>
                  <strong>{{ exame.nome }}</strong>
                  <div class="muted">Inscrições até {{ exame.dataFinalInscricao | date:'dd/MM/yyyy' }}</div>
                </td>
                <td>{{ exame.local || 'Não informado' }}</td>
                <td><app-exame-status-badge [status]="exame.status" /></td>
                <td class="actions-column">
                  <div class="row-actions">
                    <a mat-icon-button [routerLink]="['/app/graduacoes/exames', exame.id]" matTooltip="Visualizar">
                      <span class="material-symbols-outlined">visibility</span>
                    </a>
                    @if (podeEditar(exame)) {
                      <a mat-icon-button [routerLink]="['/app/graduacoes/exames', exame.id, 'editar']" matTooltip="Editar">
                        <span class="material-symbols-outlined">edit</span>
                      </a>
                    }
                    <button mat-icon-button type="button" (click)="copiarLink(exame)" matTooltip="Copiar link público">
                      <span class="material-symbols-outlined">content_copy</span>
                    </button>
                    @if (proximaAcaoStatus(exame); as acao) {
                      <button mat-icon-button type="button" (click)="alterarStatus(exame, acao.status)" [matTooltip]="acao.label">
                        <span class="material-symbols-outlined">{{ acao.icon }}</span>
                      </button>
                    }
                    @if (ehHonbu()) {
                      <button mat-icon-button type="button" (click)="alterarStatus(exame, 'CANCELADO')" matTooltip="Cancelar exame" [disabled]="!podeCancelar(exame)">
                        <span class="material-symbols-outlined">block</span>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">Nenhum exame encontrado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .filters {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      padding: 14px;
    }
    .actions-column { text-align: center; }
    .actions-column .row-actions { justify-content: center; }
    @media (max-width: 900px) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 560px) { .filters { grid-template-columns: 1fr; } }
  `],
})
export class ExamesFaixaListComponent implements OnInit {
  readonly exames = signal<ExameFaixa[]>([]);
  readonly statusControl = new FormControl<StatusExameFaixa | ''>('', { nonNullable: true });
  readonly periodoControl = new FormControl('90', { nonNullable: true });
  readonly filialControl = new FormControl('', { nonNullable: true });
  readonly pesquisaControl = new FormControl('', { nonNullable: true });

  private readonly statusFiltro = toSignal(this.statusControl.valueChanges.pipe(startWith(this.statusControl.value)), { initialValue: '' as StatusExameFaixa | '' });
  private readonly periodoFiltro = toSignal(this.periodoControl.valueChanges.pipe(startWith(this.periodoControl.value)), { initialValue: '90' });
  private readonly filialFiltro = toSignal(this.filialControl.valueChanges.pipe(startWith(this.filialControl.value)), { initialValue: '' });
  private readonly pesquisaFiltro = toSignal(this.pesquisaControl.valueChanges.pipe(startWith(this.pesquisaControl.value)), { initialValue: '' });

  readonly statusOptions = [
    { value: 'RASCUNHO', label: 'Rascunho' },
    { value: 'INSCRICOES_ABERTAS', label: 'Inscrições abertas' },
    { value: 'AGUARDANDO_PAGAMENTOS', label: 'Aguardando pagamentos' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'ENCERRADO', label: 'Encerrado' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ] as const;

  readonly filiais = computed(() => [...new Set(this.exames().map((exame) => exame.filialId))]);

  readonly examesFiltrados = computed(() => {
    const status = this.statusFiltro();
    const periodo = this.periodoFiltro();
    const filial = this.filialFiltro();
    const pesquisa = this.pesquisaFiltro().toLocaleLowerCase().trim();
    const hoje = new Date();

    return this.exames().filter((exame) => {
      const data = new Date(`${exame.dataExame}T00:00:00`);
      const dias = Math.floor(Math.abs(hoje.getTime() - data.getTime()) / 86400000);
      const texto = `${exame.nome} ${exame.local ?? ''} ${exame.status}`.toLocaleLowerCase();
      return (!status || exame.status === status)
        && (periodo === 'todos' || dias <= Number(periodo))
        && (!filial || exame.filialId === filial)
        && (!pesquisa || texto.includes(pesquisa));
    });
  });

  constructor(
    private readonly examesService: ExamesFaixaService,
    private readonly notification: NotificationService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.examesService.listar().subscribe((exames) => this.exames.set(exames));
  }

  ehHonbu(): boolean {
    const perfil = this.auth.usuario()?.perfil;
    return perfil === 'MATRIZ_ADMIN' || perfil === 'MATRIZ_OPERADOR';
  }

  podeEditar(exame: ExameFaixa): boolean {
    return exame.status !== 'ENCERRADO' && exame.status !== 'CANCELADO';
  }

  podeCancelar(exame: ExameFaixa): boolean {
    return exame.status !== 'ENCERRADO' && exame.status !== 'CANCELADO';
  }

  proximaAcaoStatus(exame: ExameFaixa): AcaoStatusExame | null {
    const acoes: Partial<Record<StatusExameFaixa, AcaoStatusExame>> = {
      RASCUNHO: { status: 'INSCRICOES_ABERTAS', label: 'Publicar exame', icon: 'publish' },
      INSCRICOES_ABERTAS: { status: 'INSCRICOES_ENCERRADAS', label: 'Encerrar inscrições', icon: 'event_busy' },
      INSCRICOES_ENCERRADAS: { status: 'AGUARDANDO_PAGAMENTOS', label: 'Aguardar pagamentos', icon: 'payments' },
      AGUARDANDO_PAGAMENTOS: { status: 'CONFIRMADO', label: 'Confirmar exame', icon: 'task_alt' },
      CONFIRMADO: { status: 'EM_REALIZACAO', label: 'Iniciar realização', icon: 'play_arrow' },
      EM_REALIZACAO: { status: 'ENCERRADO', label: 'Encerrar exame', icon: 'flag' },
    };
    return acoes[exame.status] ?? null;
  }

  alterarStatus(exame: ExameFaixa, status: StatusExameFaixa): void {
    this.examesService.alterarStatus(exame.id, status).subscribe((atualizado) => {
      this.exames.update((exames) => exames.map((item) => item.id === atualizado.id ? atualizado : item));
      this.notification.sucesso('Status do exame atualizado.');
    });
  }

  copiarLink(exame: ExameFaixa): void {
    if (exame.id.startsWith('mock-')) {
      this.notification.erro('Link público indisponível: os exames exibidos são dados temporários porque a API não respondeu.');
      return;
    }
    this.examesService.linkPublico(exame.id).subscribe({
      next: ({ tokenPublico }) => {
        if (!tokenPublico) {
          this.notification.erro('Link público ainda não disponível.');
          return;
        }
        const link = `${window.location.origin}/exames/inscricao-publica/${tokenPublico}`;
        navigator.clipboard.writeText(link);
        this.notification.sucesso('Link público copiado.');
      },
      error: () => this.notification.erro('Não foi possível obter o link público do exame.'),
    });
  }
}

interface AcaoStatusExame {
  status: StatusExameFaixa;
  label: string;
  icon: string;
}
