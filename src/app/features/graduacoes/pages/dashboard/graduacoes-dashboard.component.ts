import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { DashboardStatCardComponent } from '../../components/dashboard-stat-card/dashboard-stat-card.component';
import { GraduacaoStatusBadgeComponent } from '../../components/graduacao-status-badge/graduacao-status-badge.component';
import { GraduacoesDashboardService } from '../../services/graduacoes-dashboard.service';
import { ExameGraduacaoResumo, GraduacoesDashboard, StatusExameGraduacao } from '../../models/graduacoes-dashboard.models';

@Component({
  selector: 'app-graduacoes-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    DashboardStatCardComponent,
    GraduacaoStatusBadgeComponent,
  ],
  template: `
    <section class="graduacoes-page">
      <header class="module-header">
        <div>
          <p class="eyebrow">Graduações</p>
          <h1>Dashboard</h1>
          <p>Visão operacional dos exames, pendências de certificado e candidatos em acompanhamento.</p>
        </div>

        <button mat-flat-button color="primary" type="button" routerLink="/app/graduacoes/exames/novo">
          <span class="material-symbols-outlined">add</span>
          Novo Exame de Faixa
        </button>
      </header>

      <section class="stats-grid" aria-label="Indicadores de graduacoes">
        @for (card of dashboard()?.cards ?? []; track card.chave) {
          <app-dashboard-stat-card [card]="card" />
        }
      </section>

      <section class="panel exams-panel">
        <div class="panel-toolbar">
          <div>
            <h2>Exames mais recentes</h2>
            <p>{{ examesFiltrados().length }} registros encontrados</p>
          </div>

          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Filial</mat-label>
              <mat-select [formControl]="filialControl">
                <mat-option value="">Todas</mat-option>
                @for (filial of filiais(); track filial) {
                  <mat-option [value]="filial">{{ filial }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusControl">
                <mat-option value="">Todos</mat-option>
                @for (status of statusDisponiveis; track status.valor) {
                  <mat-option [value]="status.valor">{{ status.label }}</mat-option>
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

            <mat-form-field class="quick-search" appearance="outline">
              <mat-label>Pesquisa rápida</mat-label>
              <input matInput [formControl]="pesquisaControl" placeholder="Filial, examinador ou status" />
              <span matSuffix class="material-symbols-outlined">search</span>
            </mat-form-field>
          </div>
        </div>

        <div class="table-wrap modern-table-wrap">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Filial</th>
                <th>Examinador</th>
                <th class="numeric">Candidatos</th>
                <th>Status</th>
                <th class="actions-col">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (exame of examesFiltrados(); track exame.id) {
                <tr>
                  <td>
                    <strong>{{ exame.data | date: 'dd/MM/yyyy' }}</strong>
                  </td>
                  <td>{{ exame.filial }}</td>
                  <td>{{ exame.examinador }}</td>
                  <td class="numeric">{{ exame.quantidadeCandidatos }}</td>
                  <td><app-graduacao-status-badge [status]="exame.status" /></td>
                  <td>
                    <div class="row-actions">
                      <button mat-icon-button type="button" matTooltip="Visualizar">
                        <span class="material-symbols-outlined">visibility</span>
                      </button>

                      @if (podeEditar(exame)) {
                        <button mat-icon-button type="button" matTooltip="Editar">
                          <span class="material-symbols-outlined">edit</span>
                        </button>
                      }

                      @if (podeEncerrar(exame)) {
                        <button mat-icon-button type="button" matTooltip="Encerrar">
                          <span class="material-symbols-outlined">flag</span>
                        </button>
                      }

                      @if (podeEmitirCertificados(exame)) {
                        <button mat-icon-button type="button" matTooltip="Emitir certificados">
                          <span class="material-symbols-outlined">workspace_premium</span>
                        </button>
                      }

                      <button mat-icon-button type="button" [matMenuTriggerFor]="acoesMenu" matTooltip="Mais ações">
                        <span class="material-symbols-outlined">more_vert</span>
                      </button>
                      <mat-menu #acoesMenu="matMenu">
                        <button mat-menu-item type="button">
                          <span class="material-symbols-outlined">open_in_new</span>
                          <span>Abrir detalhes</span>
                        </button>
                        <button mat-menu-item type="button">
                          <span class="material-symbols-outlined">receipt_long</span>
                          <span>Relatório financeiro</span>
                        </button>
                      </mat-menu>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-state">
                    <span class="material-symbols-outlined">search_off</span>
                    Nenhum exame encontrado para os filtros selecionados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styleUrl: './graduacoes-dashboard.component.scss',
})
export class GraduacoesDashboardComponent implements OnInit {
  readonly dashboard = signal<GraduacoesDashboard | null>(null);

  readonly filialControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl<StatusExameGraduacao | ''>('', { nonNullable: true });
  readonly periodoControl = new FormControl('90', { nonNullable: true });
  readonly pesquisaControl = new FormControl('', { nonNullable: true });

  private readonly filialSelecionada = toSignal(this.filialControl.valueChanges.pipe(startWith(this.filialControl.value)), { initialValue: '' });
  private readonly statusSelecionado = toSignal(this.statusControl.valueChanges.pipe(startWith(this.statusControl.value)), { initialValue: '' as StatusExameGraduacao | '' });
  private readonly periodoSelecionado = toSignal(this.periodoControl.valueChanges.pipe(startWith(this.periodoControl.value)), { initialValue: '90' });
  private readonly pesquisaSelecionada = toSignal(this.pesquisaControl.valueChanges.pipe(startWith(this.pesquisaControl.value)), { initialValue: '' });

  readonly statusDisponiveis: { valor: StatusExameGraduacao; label: string }[] = [
    { valor: 'PROGRAMADO', label: 'Programado' },
    { valor: 'EM_AVALIACAO', label: 'Em Avaliação' },
    { valor: 'EM_OBSERVACAO', label: 'Em Observação' },
    { valor: 'AGUARDANDO_CERTIFICADO', label: 'Aguardando Certificado' },
    { valor: 'FINALIZADO', label: 'Finalizado' },
    { valor: 'CANCELADO', label: 'Cancelado' },
  ];

  readonly filiais = computed(() => {
    const nomes = this.dashboard()?.examesRecentes.map((exame) => exame.filial) ?? [];
    return [...new Set(nomes)].sort((a, b) => a.localeCompare(b));
  });

  readonly examesFiltrados = computed(() => {
    const filial = this.filialSelecionada();
    const status = this.statusSelecionado();
    const pesquisa = this.pesquisaSelecionada().trim().toLocaleLowerCase();
    const periodo = this.periodoSelecionado();
    const hoje = new Date();

    return (this.dashboard()?.examesRecentes ?? []).filter((exame) => {
      const texto = `${exame.filial} ${exame.examinador} ${exame.status}`.toLocaleLowerCase();
      const data = new Date(`${exame.data}T00:00:00`);
      const dias = Math.floor((hoje.getTime() - data.getTime()) / 86400000);
      const dentroPeriodo = periodo === 'todos' || dias <= Number(periodo);

      return (!filial || exame.filial === filial)
        && (!status || exame.status === status)
        && (!pesquisa || texto.includes(pesquisa))
        && dentroPeriodo;
    });
  });

  constructor(
    private readonly dashboardService: GraduacoesDashboardService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.dashboardService.carregarDashboard().subscribe((dashboard) => this.dashboard.set(dashboard));
  }

  podeEditar(exame: ExameGraduacaoResumo): boolean {
    const usuario = this.auth.usuario();
    const statusEditavel = exame.status !== 'FINALIZADO' && exame.status !== 'CANCELADO';
    return !!usuario && statusEditavel && ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_RESPONSAVEL'].includes(usuario.perfil);
  }

  podeEncerrar(exame: ExameGraduacaoResumo): boolean {
    return this.ehHonbu() && exame.status !== 'FINALIZADO' && exame.status !== 'CANCELADO';
  }

  podeEmitirCertificados(exame: ExameGraduacaoResumo): boolean {
    return this.ehHonbu() && exame.status === 'AGUARDANDO_CERTIFICADO';
  }

  private ehHonbu(): boolean {
    const perfil = this.auth.usuario()?.perfil;
    return perfil === 'MATRIZ_ADMIN' || perfil === 'MATRIZ_OPERADOR';
  }
}
