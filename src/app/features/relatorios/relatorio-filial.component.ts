import { Component, OnInit, computed, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Filial, Filiado } from '../../core/models/cadastro.models';
import { AuthService } from '../../core/auth/auth.service';
import { FiliadosService } from '../../core/services/filiados.service';
import { FiliaisService } from '../../core/services/filiais.service';

@Component({
  selector: 'app-relatorio-filial',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Relatorio por filial</h1>
          <p class="page-subtitle">Resumo operacional dos filiados por dojo/academia.</p>
        </div>
      </header>

      <div class="panel panel-pad">
        @if (mensagem()) {
          <p class="empty-state">{{ mensagem() }}</p>
        } @else {
          <mat-form-field appearance="outline">
            <mat-label>Filial</mat-label>
            <mat-select
              [disabled]="usuarioDeFilial()"
              [ngModel]="filialSelecionada()"
              (ngModelChange)="selecionarFilial($event)"
            >
              @for (filial of filiais(); track filial.id) {
                <mat-option [value]="filial.id">{{ filial.codigo }} - {{ filial.nome }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </div>

      <div class="metrics">
        <div class="panel panel-pad metric">
          <span>Total</span>
          <strong>{{ filiados().length }}</strong>
        </div>
        <div class="panel panel-pad metric">
          <span>Ativos</span>
          <strong>{{ ativos() }}</strong>
        </div>
        <div class="panel panel-pad metric">
          <span>Inativos</span>
          <strong>{{ inativos() }}</strong>
        </div>
        @if (representanteDeFilial()) {
          <div class="panel panel-pad metric pending">
            <span>Filiados pendentes</span>
            <strong>{{ filiadosPendentes() }}</strong>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    mat-form-field {
      width: min(520px, 100%);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .metric span {
      color: var(--app-muted);
      font-weight: 700;
    }

    .metric strong {
      display: block;
      margin-top: 8px;
      font-size: 2rem;
    }

    .metric.pending strong {
      color: #b7791f;
    }

    .empty-state {
      margin: 0;
      color: var(--app-muted);
      font-weight: 700;
    }

    @media (max-width: 820px) {
      .metrics {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class RelatorioFilialComponent implements OnInit {
  readonly filiais = signal<Filial[]>([]);
  readonly filiados = signal<Filiado[]>([]);
  readonly filiadosPendentes = signal(0);
  readonly filialSelecionada = signal<string | null>(null);
  readonly mensagem = signal<string | null>(null);
  readonly usuarioDeFilial = computed(() => !this.auth.possuiPermissao(['RELATORIO_VISUALIZAR_TODOS']));
  readonly representanteDeFilial = computed(() => this.auth.possuiPerfil(['FILIAL_RESPONSAVEL']));
  readonly ativos = computed(() => this.filiados().filter((filiado) => filiado.status === 'ATIVO').length);
  readonly inativos = computed(() => this.filiados().filter((filiado) => filiado.status === 'INATIVO').length);

  constructor(
    private readonly auth: AuthService,
    private readonly filiaisService: FiliaisService,
    private readonly filiadosService: FiliadosService,
  ) {}

  ngOnInit(): void {
    const usuario = this.auth.usuario();
    if (this.usuarioDeFilial()) {
      if (!usuario?.filialId) {
        this.mensagem.set('Seu usuario nao esta vinculado a uma filial.');
        return;
      }
      this.carregarFilialDoUsuario(usuario.filialId);
      return;
    }

    this.filiaisService.listar().subscribe((filiais) => {
      this.filiais.set(filiais);
      if (filiais.length > 0) {
        this.selecionarFilial(filiais[0].id);
      } else {
        this.mensagem.set('Nenhuma filial disponivel para consulta.');
      }
    });
  }

  selecionarFilial(filialId: string): void {
    if (!filialId) {
      return;
    }
    this.filialSelecionada.set(filialId);
    this.filiadosService.listar(filialId).subscribe((filiados) => this.filiados.set(filiados));
    if (this.representanteDeFilial()) {
      this.filiadosService.listarPendentes(filialId).subscribe((filiados) => this.filiadosPendentes.set(filiados.length));
    }
  }

  private carregarFilialDoUsuario(filialId: string): void {
    this.filiaisService.buscarPorId(filialId).subscribe({
      next: (filial) => {
        this.filiais.set([filial]);
        this.selecionarFilial(filial.id);
      },
      error: () => this.mensagem.set('Nao foi possivel carregar a filial vinculada ao seu usuario.'),
    });
  }
}
