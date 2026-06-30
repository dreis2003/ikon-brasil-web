import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { UsuarioSistema } from '../../core/models/auth.models';
import { Filial } from '../../core/models/cadastro.models';
import { FiliaisService } from '../../core/services/filiais.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PerfilUsuarioPipe } from '../../shared/pipes/perfil-usuario.pipe';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, StatusBadgeComponent, PerfilUsuarioPipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Painel HONBU</h1>
          <p class="page-subtitle">Gestao administrativa de usuarios, perfis e vinculo com filiais.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/app/honbu/usuarios/novo">
          <span class="material-symbols-outlined">person_add</span>
          Novo usuario
        </a>
      </header>

      <div class="panel table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Perfil</th>
              <th>Filial</th>
              <th>Status</th>
              <th class="actions-column">Acoes</th>
            </tr>
          </thead>
          <tbody>
            @for (usuario of usuarios(); track usuario.id) {
              <tr>
                <td>
                  <strong>{{ usuario.nome }}</strong>
                  <div class="muted">{{ usuario.email }}</div>
                </td>
                <td>{{ usuario.perfil | perfilUsuario }}</td>
                <td>{{ nomeFilial(usuario.filialId) }}</td>
                <td><app-status-badge [status]="usuario.status" /></td>
                <td class="actions-column">
                  <div class="row-actions">
                    <a mat-icon-button [routerLink]="['/app/honbu/usuarios', usuario.id]" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </a>
                    @if (usuario.status === 'ATIVO') {
                      <button mat-icon-button (click)="inativar(usuario)" title="Inativar">
                        <span class="material-symbols-outlined">block</span>
                      </button>
                    } @else {
                      <button mat-icon-button (click)="ativar(usuario)" title="Ativar">
                        <span class="material-symbols-outlined">check_circle</span>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">Nenhum usuario encontrado.</td></tr>
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
  `],
})
export class UsuariosListComponent implements OnInit {
  readonly usuarios = signal<UsuarioSistema[]>([]);
  private readonly filiaisPorId = signal<Map<string, Filial>>(new Map());

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly filiaisService: FiliaisService,
    private readonly notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  ativar(usuario: UsuarioSistema): void {
    this.usuariosService.ativar(usuario.id).subscribe(() => {
      this.notification.sucesso('Usuario ativado.');
      this.carregar();
    });
  }

  inativar(usuario: UsuarioSistema): void {
    this.usuariosService.inativar(usuario.id).subscribe(() => {
      this.notification.sucesso('Usuario inativado.');
      this.carregar();
    });
  }

  nomeFilial(filialId: string | null): string {
    if (!filialId) {
      return 'HONBU';
    }

    const filial = this.filiaisPorId().get(filialId);
    return filial ? `${filial.codigo} - ${filial.nome}` : filialId;
  }

  private carregar(): void {
    forkJoin({
      usuarios: this.usuariosService.listar(),
      filiais: this.filiaisService.listar(),
    }).subscribe(({ usuarios, filiais }) => {
      this.usuarios.set(usuarios);
      this.filiaisPorId.set(new Map(filiais.map((filial) => [filial.id, filial])));
    });
  }
}
