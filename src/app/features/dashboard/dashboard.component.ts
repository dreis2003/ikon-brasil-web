import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { FiliadosService } from '../../core/services/filiados.service';
import { FiliaisService } from '../../core/services/filiais.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visao operacional da plataforma IKO Nakamura Brasil.</p>
        </div>
      </header>

      <div class="metrics">
        <div class="panel panel-pad metric">
          <span>Filiados ativos</span>
          <strong>{{ totalFiliados() }}</strong>
        </div>
        @if (auth.possuiPerfil(['FILIAL_RESPONSAVEL'])) {
          <a class="panel panel-pad metric metric-link pending" routerLink="/app/filiados-pendentes">
            <span>Filiados pendentes</span>
            <strong>{{ totalFiliadosPendentes() }}</strong>
          </a>
        }
        <div class="panel panel-pad metric">
          <span>Filiais ativas</span>
          <strong>{{ totalFiliais() }}</strong>
        </div>
      </div>

      <div class="panel panel-pad shortcuts">
        <h2>Atalhos</h2>
        <div>
          @if (auth.possuiPermissao(['FILIADO_CRIAR'])) {
            <a mat-flat-button color="primary" routerLink="/app/filiados/novo">Novo filiado</a>
          }
          @if (auth.possuiPermissao(['FILIADO_VISUALIZAR'])) {
            <a mat-stroked-button routerLink="/app/filiados">Consultar filiados</a>
          }
          @if (auth.possuiPermissao(['FILIAL_CRIAR'])) {
            <a mat-stroked-button routerLink="/app/filiais/nova">Nova filial</a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
    }

    .metric-link {
      color: inherit;
      text-decoration: none;
      transition: border-color 0.15s ease, transform 0.15s ease;
    }

    .metric-link:hover {
      border-color: var(--app-primary);
      transform: translateY(-1px);
    }

    .metric.pending strong {
      color: #b7791f;
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

    .shortcuts h2 {
      margin: 0 0 14px;
      font-size: 1.1rem;
    }

    .shortcuts div {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    @media (max-width: 820px) {
      .metrics {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly totalFiliados = signal(0);
  readonly totalFiliadosPendentes = signal(0);
  readonly totalFiliais = signal(0);

  constructor(
    readonly auth: AuthService,
    private readonly filiadosService: FiliadosService,
    private readonly filiaisService: FiliaisService,
  ) {}

  ngOnInit(): void {
    const usuario = this.auth.usuario();
    const filialId = usuario?.filialId ?? null;

    if (this.auth.possuiPermissao(['FILIADO_VISUALIZAR'])) {
      this.filiadosService.listar(filialId).subscribe((filiados) => {
        this.totalFiliados.set(filiados.filter((filiado) => filiado.status === 'ATIVO').length);
      });
    }
    if (this.auth.possuiPerfil(['FILIAL_RESPONSAVEL']) && this.auth.possuiPermissao(['FILIADO_VISUALIZAR'])) {
      this.filiadosService.listarPendentes(filialId).subscribe((filiados) => this.totalFiliadosPendentes.set(filiados.length));
    }
    if (filialId) {
      this.filiaisService.buscarPorId(filialId).subscribe({
        next: (filial) => this.totalFiliais.set(filial.status === 'ATIVA' ? 1 : 0),
        error: () => this.totalFiliais.set(0),
      });
      return;
    }
    this.filiaisService.listar().subscribe({
      next: (filiais) => this.totalFiliais.set(filiais.filter((filial) => filial.status === 'ATIVA').length),
      error: () => this.totalFiliais.set(0),
    });
  }
}
