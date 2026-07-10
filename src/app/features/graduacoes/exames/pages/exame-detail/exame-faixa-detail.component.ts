import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../../../core/services/notification.service';
import { GraduacaoOficial } from '../../../models/graduacao-oficial.models';
import { montarOpcoesGraduacaoPretendida } from '../../../models/opcao-graduacao-pretendida.models';
import { GraduacoesOficiaisService } from '../../../services/graduacoes-oficiais.service';
import { AdicionarCandidatoDialogComponent } from '../../components/adicionar-candidato-dialog/adicionar-candidato-dialog.component';
import { CandidatoStatusBadgeComponent } from '../../components/candidato-status-badge/candidato-status-badge.component';
import { ExameStatusBadgeComponent } from '../../components/exame-status-badge/exame-status-badge.component';
import { CandidatoExame, ExameFaixa, StatusExameFaixa } from '../../models/exames-faixa.models';
import { ExamesFaixaService } from '../../services/exames-faixa.service';

@Component({
  selector: 'app-exame-faixa-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule, ExameStatusBadgeComponent, CandidatoStatusBadgeComponent],
  template: `
    @if (exame(); as exame) {
      <section class="page">
        <header class="page-header">
          <div>
            <h1 class="page-title">{{ exame.nome }}</h1>
            <p class="page-subtitle">{{ exame.local }} · {{ exame.dataExame | date:'dd/MM/yyyy' }} · {{ exame.horarioInicio }}</p>
          </div>
          <div class="header-actions">
            <a mat-button routerLink="/app/graduacoes/exames">Voltar</a>
            <a mat-flat-button color="primary" [routerLink]="['/app/graduacoes/exames', exame.id, 'editar']">Editar</a>
            @if (proximaAcaoStatus(exame); as acao) {
              <button mat-flat-button color="primary" type="button" (click)="alterarStatus(acao.status)">
                <span class="material-symbols-outlined">{{ acao.icon }}</span>
                {{ acao.label }}
              </button>
            }
            @if (podeCancelar(exame)) {
              <button mat-icon-button type="button" (click)="alterarStatus('CANCELADO')" matTooltip="Cancelar exame">
                <span class="material-symbols-outlined">block</span>
              </button>
            }
          </div>
        </header>

        <section class="detail-grid">
          <div class="panel panel-pad">
            <h2>Dados do exame</h2>
            <dl>
              <div><dt>Status</dt><dd><app-exame-status-badge [status]="exame.status" /></dd></div>
              <div><dt>Inscrições</dt><dd>{{ exame.dataAberturaInscricoes | date:'dd/MM/yyyy' }} até {{ exame.dataFinalInscricao | date:'dd/MM/yyyy' }}</dd></div>
              <div><dt>Pagamento inscrição</dt><dd>{{ exame.dataFinalPagamentoInscricao | date:'dd/MM/yyyy' }}</dd></div>
              <div><dt>Pagamento faixa/certificado</dt><dd>{{ exame.dataFinalPagamentoFaixaCertificado | date:'dd/MM/yyyy' }}</dd></div>
            </dl>
          </div>
          <div class="panel panel-pad">
            <h2>Link público</h2>
            <div class="public-link">
              <span>{{ linkPublico() || 'Link público indisponível' }}</span>
              <button mat-icon-button (click)="copiarLink()" matTooltip="Copiar link" [disabled]="!linkPublico()">
                <span class="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="candidates-toolbar">
            <div>
              <h2>Candidatos</h2>
              <p>{{ candidatos().length }} inscritos</p>
            </div>
            <button mat-flat-button color="primary" (click)="adicionarCandidato()">
              <span class="material-symbols-outlined">person_add</span>
              Adicionar filiado
            </button>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Filiado</th>
                  <th>Graduação pretendida</th>
                  <th>Faixa</th>
                  <th>Pagamento</th>
                  <th class="actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (candidato of candidatos(); track candidato.id) {
                  <tr>
                    <td>
                      <strong>{{ candidato.nomeFiliado || candidato.filiadoId }}</strong>
                      <div class="muted">{{ candidato.numeroInternacional || candidato.cpfFiliado || candidato.origemInscricao }}</div>
                    </td>
                    <td>
                      {{ nomeGraduacaoPretendida(candidato) }}
                      @if (candidato.graduacaoAtualNome) {
                        <div class="muted">Atual: {{ candidato.graduacaoAtualNome }}</div>
                      }
                    </td>
                    <td>{{ candidato.tamanhoFaixa }}</td>
                    <td><app-candidato-status-badge [status]="candidato.status" /></td>
                    <td class="actions-column">
                      <div class="row-actions">
                        @if (candidato.status === 'PAGAMENTO_PENDENTE') {
                          <button mat-icon-button (click)="confirmarPagamento(candidato)" matTooltip="Confirmar pagamento">
                            <span class="material-symbols-outlined">paid</span>
                          </button>
                        }
                        @if (candidato.status !== 'CANCELADO') {
                          <button mat-icon-button (click)="cancelar(candidato)" matTooltip="Cancelar inscrição">
                            <span class="material-symbols-outlined">block</span>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="muted">Nenhum candidato inscrito.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      </section>
    }
  `,
  styles: [`
    .header-actions { display: flex; gap: 8px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    h2 { margin: 0 0 10px; font-size: 0.95rem; font-weight: 820; }
    dl { display: grid; gap: 8px; margin: 0; }
    dl div { display: flex; justify-content: space-between; gap: 12px; }
    dt { color: var(--app-muted); font-weight: 760; }
    dd { margin: 0; text-align: right; }
    .public-link { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--app-border); border-radius: 8px; background: var(--app-surface-muted); }
    .public-link span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .candidates-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px; border-bottom: 1px solid var(--app-border); }
    .candidates-toolbar h2, .candidates-toolbar p { margin: 0; }
    .candidates-toolbar p { color: var(--app-muted); }
    .actions-column { text-align: center; }
    .actions-column .row-actions { justify-content: center; }
    @media (max-width: 800px) { .detail-grid { grid-template-columns: 1fr; } .candidates-toolbar { display: grid; } }
  `],
})
export class ExameFaixaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examesService = inject(ExamesFaixaService);
  private readonly graduacoesService = inject(GraduacoesOficiaisService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly exame = signal<ExameFaixa | null>(null);
  readonly candidatos = signal<CandidatoExame[]>([]);
  readonly graduacoes = signal<GraduacaoOficial[]>([]);
  readonly opcoesGraduacaoPretendida = computed(() => montarOpcoesGraduacaoPretendida(this.graduacoes()));
  readonly linkPublico = signal('');
  private readonly exameId = this.route.snapshot.paramMap.get('id') as string;

  ngOnInit(): void {
    this.graduacoesService.listar().subscribe((graduacoes) => this.graduacoes.set(graduacoes));
    this.carregar();
  }

  nomeGraduacaoPretendida(candidato: CandidatoExame): string {
    return this.opcoesGraduacaoPretendida().find((opcao) => opcao.id === candidato.graduacaoPretendidaId)?.label
      || candidato.graduacaoPretendidaNome
      || candidato.graduacaoPretendidaId;
  }

  adicionarCandidato(): void {
    this.dialog.open(AdicionarCandidatoDialogComponent, { width: '680px', maxWidth: 'calc(100vw - 32px)' })
      .afterClosed()
      .subscribe((request) => {
        if (!request) return;
        this.examesService.adicionarCandidato(this.exameId, request).subscribe(() => {
          this.notification.sucesso('Candidato adicionado.');
          this.carregar();
        });
      });
  }

  confirmarPagamento(candidato: CandidatoExame): void {
    this.examesService.confirmarPagamento(this.exameId, candidato.id).subscribe(() => {
      this.notification.sucesso('Pagamento confirmado.');
      this.carregar();
    });
  }

  cancelar(candidato: CandidatoExame): void {
    this.examesService.cancelarCandidato(this.exameId, candidato.id).subscribe(() => {
      this.notification.sucesso('Inscrição cancelada.');
      this.carregar();
    });
  }

  copiarLink(): void {
    if (!this.linkPublico()) return;
    navigator.clipboard.writeText(this.linkPublico());
    this.notification.sucesso('Link copiado.');
  }

  podeCancelar(exame: ExameFaixa): boolean {
    return exame.status !== 'ENCERRADO' && exame.status !== 'CANCELADO';
  }

  proximaAcaoStatus(exame: ExameFaixa): AcaoStatusExame | null {
    const acoes: Partial<Record<StatusExameFaixa, AcaoStatusExame>> = {
      RASCUNHO: { status: 'INSCRICOES_ABERTAS', label: 'Publicar', icon: 'publish' },
      INSCRICOES_ABERTAS: { status: 'INSCRICOES_ENCERRADAS', label: 'Encerrar inscrições', icon: 'event_busy' },
      INSCRICOES_ENCERRADAS: { status: 'AGUARDANDO_PAGAMENTOS', label: 'Aguardar pagamentos', icon: 'payments' },
      AGUARDANDO_PAGAMENTOS: { status: 'CONFIRMADO', label: 'Confirmar', icon: 'task_alt' },
      CONFIRMADO: { status: 'EM_REALIZACAO', label: 'Iniciar', icon: 'play_arrow' },
      EM_REALIZACAO: { status: 'ENCERRADO', label: 'Encerrar', icon: 'flag' },
    };
    return acoes[exame.status] ?? null;
  }

  alterarStatus(status: StatusExameFaixa): void {
    this.examesService.alterarStatus(this.exameId, status).subscribe((exame) => {
      this.exame.set(exame);
      this.notification.sucesso('Status do exame atualizado.');
    });
  }

  private carregar(): void {
    this.examesService.buscar(this.exameId).subscribe((exame) => this.exame.set(exame));
    this.examesService.listarCandidatos(this.exameId).subscribe((candidatos) => this.candidatos.set(candidatos));
    this.examesService.linkPublico(this.exameId).subscribe({
      next: ({ tokenPublico }) => {
        this.linkPublico.set(tokenPublico ? `${window.location.origin}/exames/inscricao-publica/${tokenPublico}` : '');
      },
      error: () => {
        this.linkPublico.set('');
        this.notification.erro('Não foi possível obter o link público do exame.');
      },
    });
  }
}

interface AcaoStatusExame {
  status: StatusExameFaixa;
  label: string;
  icon: string;
}
