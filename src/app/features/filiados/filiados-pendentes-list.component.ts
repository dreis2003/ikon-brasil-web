import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Filial, Filiado } from '../../core/models/cadastro.models';
import { FiliadosService } from '../../core/services/filiados.service';
import { FiliaisService } from '../../core/services/filiais.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-filiados-pendentes-list',
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, StatusBadgeComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Filiados Pendentes</h1>
          <p class="page-subtitle">Autocadastros aguardando revisao e aprovacao do responsavel.</p>
        </div>
      </header>

      <div class="panel panel-pad filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar por nome, CPF ou email</mat-label>
          <input matInput [ngModel]="busca()" (ngModelChange)="busca.set($event)" />
        </mat-form-field>
      </div>

      <div class="panel table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Filiado</th>
              <th>Filial</th>
              <th>Email</th>
              <th>Status</th>
              <th class="actions-column">Acoes</th>
            </tr>
          </thead>
          <tbody>
            @for (filiado of filiadosFiltrados(); track filiado.id) {
              <tr>
                <td>
                  <div class="person">
                    <img [src]="filiado.fotoPerfilUrl || '/assets/logo-ikon.png'" alt="" />
                    <div>
                      <strong>{{ filiado.nomeCompleto }}</strong>
                      <span>{{ filiado.telefone || 'Sem telefone' }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ nomeFilial(filiado.filialId) }}</td>
                <td>{{ filiado.email || '-' }}</td>
                <td><app-status-badge [status]="filiado.status" /></td>
                <td class="actions-column">
                  <div class="row-actions">
                    <a mat-icon-button [routerLink]="['/app/filiados-pendentes', filiado.id]" title="Revisar">
                      <span class="material-symbols-outlined">fact_check</span>
                    </a>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">Nenhum autocadastro pendente.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .actions-column {
      text-align: center;
    }

    .actions-column .row-actions {
      justify-content: center;
    }

    .filters {
      padding-bottom: 0;
    }

    .filters mat-form-field {
      width: min(520px, 100%);
    }

    .person {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .person img {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--app-surface-muted);
      border: 1px solid var(--app-border);
    }

    .person strong,
    .person span {
      display: block;
    }

    .person span {
      margin-top: 2px;
      color: var(--app-muted);
      font-size: 0.8rem;
    }
  `],
})
export class FiliadosPendentesListComponent implements OnInit {
  readonly filiados = signal<Filiado[]>([]);
  private readonly filiaisPorId = signal<Map<string, Filial>>(new Map());
  readonly busca = signal('');
  readonly filiadosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    if (!termo) {
      return this.filiados();
    }
    return this.filiados().filter((filiado) =>
      [filiado.nomeCompleto, filiado.cpf, filiado.email].some((valor) => valor?.toLowerCase().includes(termo)),
    );
  });

  constructor(
    readonly auth: AuthService,
    private readonly filiadosService: FiliadosService,
    private readonly filiaisService: FiliaisService,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  nomeFilial(filialId: string): string {
    const filial = this.filiaisPorId().get(filialId);
    return filial ? `${filial.codigo} - ${filial.nome}` : filialId;
  }

  private carregar(): void {
    this.filiadosService.listarPendentes().subscribe((filiados) => {
      this.filiados.set(filiados);
      this.carregarFiliais(filiados);
    });
  }

  private carregarFiliais(filiados: Filiado[]): void {
    if (this.auth.possuiPerfil(['MATRIZ_ADMIN'])) {
      this.filiaisService.listar().subscribe((filiais) => {
        this.filiaisPorId.set(new Map(filiais.map((filial) => [filial.id, filial])));
      });
      return;
    }

    const filialIds = [...new Set(filiados.map((filiado) => filiado.filialId))];
    if (filialIds.length === 0) {
      this.filiaisPorId.set(new Map());
      return;
    }

    forkJoin(filialIds.map((id) => this.filiaisService.buscarPorId(id).pipe(catchError(() => of(null))))).subscribe((filiais) => {
      const filiaisEncontradas = filiais.filter((filial): filial is Filial => filial !== null);
      this.filiaisPorId.set(new Map(filiaisEncontradas.map((filial) => [filial.id, filial])));
    });
  }
}
