import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioSistema } from '../../core/models/auth.models';
import { Filial } from '../../core/models/cadastro.models';
import { FiliaisService } from '../../core/services/filiais.service';
import { NotificationService } from '../../core/services/notification.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';

@Component({
  selector: 'app-filiais-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatDialogModule, MatIconModule, StatusBadgeComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Filiais</h1>
          <p class="page-subtitle">Dojo, academia ou filial vinculada a IKO Nakamura Brasil.</p>
        </div>
        @if (auth.possuiPermissao(['FILIAL_CRIAR'])) {
          <a mat-flat-button color="primary" routerLink="/app/filiais/nova">
            <span class="material-symbols-outlined">add</span>
            Nova filial
          </a>
        }
      </header>

      <div class="panel table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nome</th>
              <th>Responsavel</th>
              <th>Cidade</th>
              <th>Status</th>
              <th class="actions-column">Acoes</th>
            </tr>
          </thead>
          <tbody>
            @for (filial of filiais(); track filial.id) {
              <tr>
                <td><strong>{{ filial.codigo }}</strong></td>
                <td>
                  <button class="link-button" type="button" (click)="abrirDetalheFilial(filial)">
                    {{ filial.nome }}
                  </button>
                </td>
                <td>
                  @if (responsaveis(filial).length > 0) {
                    <button class="link-button" type="button" (click)="abrirResponsaveis(filial)">
                      {{ responsaveis(filial).length > 1 ? 'Representantes...' : responsaveis(filial)[0].nome }}
                    </button>
                  } @else {
                    <span class="muted">Sem representante</span>
                  }
                </td>
                <td>{{ filial.cidade }} / {{ filial.estado }}</td>
                <td><app-status-badge [status]="filial.status" /></td>
                <td class="actions-column">
                  <div class="row-actions">
                    @if (auth.possuiPermissao(['FILIAL_EDITAR'])) {
                      <a mat-icon-button [routerLink]="['/app/filiais', filial.id]" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                      </a>
                      @if (filial.status === 'ATIVA') {
                        <button mat-icon-button (click)="inativar(filial)" title="Inativar">
                          <span class="material-symbols-outlined">block</span>
                        </button>
                      } @else {
                        <button mat-icon-button (click)="ativar(filial)" title="Ativar">
                          <span class="material-symbols-outlined">check_circle</span>
                        </button>
                      }
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="muted">Nenhuma filial encontrada.</td></tr>
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

    .link-button {
      appearance: none;
      border: 0;
      background: transparent;
      color: var(--app-primary);
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      padding: 0;
      text-align: left;
    }

    .link-button:hover {
      text-decoration: underline;
    }
  `],
})
export class FiliaisListComponent implements OnInit {
  readonly filiais = signal<Filial[]>([]);
  readonly usuarios = signal<UsuarioSistema[]>([]);
  private readonly dialog = inject(MatDialog);

  constructor(
    readonly auth: AuthService,
    private readonly filiaisService: FiliaisService,
    private readonly usuariosService: UsuariosService,
    private readonly notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  ativar(filial: Filial): void {
    this.filiaisService.ativar(filial.id).subscribe(() => {
      this.notification.sucesso('Filial ativada.');
      this.carregar();
    });
  }

  inativar(filial: Filial): void {
    this.filiaisService.inativar(filial.id).subscribe(() => {
      this.notification.sucesso('Filial inativada.');
      this.carregar();
    });
  }

  responsaveis(filial: Filial): ResponsavelFilial[] {
    const representantesUsuarios = this.usuarios()
      .filter((usuario) => usuario.perfil === 'FILIAL_RESPONSAVEL' && usuario.filialId === filial.id)
      .map((usuario) => ({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone ?? null,
        filial: `${filial.codigo} - ${filial.nome}`,
      }));

    if (representantesUsuarios.length > 0) {
      return representantesUsuarios;
    }

    if (filial.responsavel) {
      return [{
        nome: filial.responsavel,
        email: filial.emailResponsavel ?? null,
        telefone: filial.telefone ?? null,
        filial: `${filial.codigo} - ${filial.nome}`,
      }];
    }

    return [];
  }

  abrirResponsaveis(filial: Filial): void {
    const responsaveis = this.responsaveis(filial);
    if (responsaveis.length === 0) {
      return;
    }

    if (responsaveis.length === 1) {
      this.abrirDetalheResponsavel(responsaveis[0]);
      return;
    }

    this.dialog.open(ResponsaveisFilialDialogComponent, {
      width: '680px',
      maxWidth: 'calc(100vw - 32px)',
      data: responsaveis,
    });
  }

  abrirDetalheFilial(filial: Filial): void {
    this.dialog.open(DetalheFilialDialogComponent, {
      width: '680px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        filial,
        responsaveis: this.responsaveis(filial),
      } satisfies DetalheFilialDialogData,
    });
  }

  private abrirDetalheResponsavel(responsavel: ResponsavelFilial): void {
    this.dialog.open(DetalheResponsavelFilialDialogComponent, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: responsavel,
    });
  }

  private carregar(): void {
    this.filiaisService.listar().subscribe((filiais) => this.filiais.set(filiais));
    this.usuariosService.listar()
      .pipe(catchError(() => of([])))
      .subscribe((usuarios) => this.usuarios.set(usuarios));
  }
}

interface ResponsavelFilial {
  nome: string;
  email: string | null;
  telefone: string | null;
  filial: string;
}

interface DetalheFilialDialogData {
  filial: Filial;
  responsaveis: ResponsavelFilial[];
}

@Component({
  selector: 'app-detalhe-filial-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, StatusBadgeComponent, DataBrPipe],
  template: `
    <h2 mat-dialog-title>Dados da filial</h2>
    <mat-dialog-content>
      <div class="profile">
        <img [src]="data.filial.logoUrl || '/assets/logo-ikon.png'" alt="" />
        <div>
          <strong>{{ data.filial.codigo }} - {{ data.filial.nome }}</strong>
          <span>{{ data.filial.cidade }} / {{ data.filial.estado }}</span>
          <app-status-badge [status]="data.filial.status" />
        </div>
      </div>

      <section class="detail-section">
        <h3>Dados cadastrais</h3>
        <dl class="details-grid">
          <div><dt>Codigo</dt><dd>{{ data.filial.codigo }}</dd></div>
          <div class="span-2"><dt>Nome</dt><dd>{{ data.filial.nome }}</dd></div>
          <div><dt>Cidade</dt><dd>{{ data.filial.cidade }}</dd></div>
          <div><dt>Estado</dt><dd>{{ data.filial.estado }}</dd></div>
          <div><dt>Status</dt><dd>{{ status(data.filial.status) }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>Contato</h3>
        <dl class="details-grid">
          <div class="span-2"><dt>Responsavel informado</dt><dd>{{ data.filial.responsavel || '-' }}</dd></div>
          <div><dt>Telefone</dt><dd>{{ data.filial.telefone || '-' }}</dd></div>
          <div class="span-2"><dt>Email do responsavel</dt><dd>{{ data.filial.emailResponsavel || '-' }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>Endereco</h3>
        <dl class="details-grid">
          <div class="span-2"><dt>Logradouro</dt><dd>{{ data.filial.logradouro || '-' }}</dd></div>
          <div><dt>Numero</dt><dd>{{ data.filial.numero || '-' }}</dd></div>
          <div><dt>Complemento</dt><dd>{{ data.filial.complemento || '-' }}</dd></div>
          <div><dt>Bairro</dt><dd>{{ data.filial.bairro || '-' }}</dd></div>
          <div><dt>Cidade</dt><dd>{{ data.filial.cidade || '-' }}</dd></div>
          <div><dt>UF</dt><dd>{{ data.filial.estado || '-' }}</dd></div>
          <div><dt>CEP</dt><dd>{{ data.filial.cep || '-' }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>Representantes</h3>
        @if (data.responsaveis.length > 0) {
          <dl class="details-grid">
            @for (responsavel of data.responsaveis; track responsavel.nome) {
              <div class="span-3">
                <dt>{{ responsavel.nome }}</dt>
                <dd>{{ responsavel.email || '-' }} · {{ responsavel.telefone || '-' }}</dd>
              </div>
            }
          </dl>
        } @else {
          <p class="empty">Nenhum representante vinculado.</p>
        }
      </section>

      <section class="detail-section">
        <h3>Controle</h3>
        <dl class="details-grid">
          <div><dt>Cadastro</dt><dd>{{ data.filial.dataCadastro | dataBr }}</dd></div>
          <div><dt>Atualizacao</dt><dd>{{ data.filial.dataAtualizacao | dataBr }}</dd></div>
        </dl>
      </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .profile {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .profile img {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid var(--app-border);
      background: var(--app-surface-muted);
    }

    .profile strong,
    .profile span {
      display: block;
    }

    .profile strong {
      color: var(--app-text);
      font-size: 0.92rem;
      margin-bottom: 2px;
    }

    .profile span {
      color: var(--app-muted);
      font-size: 0.74rem;
      margin-bottom: 5px;
    }

    .detail-section {
      border-top: 1px solid var(--app-border);
      padding-top: 10px;
      margin-top: 10px;
    }

    .detail-section h3 {
      margin: 0 0 8px;
      color: var(--app-text);
      font-size: 0.82rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      column-gap: 10px;
      row-gap: 8px;
      margin: 0;
    }

    .details-grid dt {
      color: var(--app-muted);
      font-size: 0.62rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .details-grid dd {
      color: var(--app-text);
      margin: 2px 0 0;
      font-weight: 700;
      font-size: 0.76rem;
      overflow-wrap: anywhere;
    }

    .span-2 {
      grid-column: span 2;
    }

    .span-3 {
      grid-column: span 3;
    }

    .empty {
      color: var(--app-muted);
      margin: 0;
    }

    @media (max-width: 700px) {
      .details-grid {
        grid-template-columns: 1fr;
      }

      .span-2,
      .span-3 {
        grid-column: span 1;
      }
    }
  `],
})
class DetalheFilialDialogComponent {
  readonly data = inject<DetalheFilialDialogData>(MAT_DIALOG_DATA);

  status(valor: string): string {
    return valor === 'ATIVA' ? 'Ativa' : 'Inativa';
  }
}

@Component({
  selector: 'app-responsaveis-filial-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Representantes da filial</h2>
    <mat-dialog-content>
      <table class="data-table dialog-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
          </tr>
        </thead>
        <tbody>
          @for (responsavel of responsaveis; track responsavel.nome) {
            <tr>
              <td>
                <button class="link-button" type="button" (click)="abrirDetalhe(responsavel)">
                  {{ responsavel.nome }}
                </button>
              </td>
              <td>{{ responsavel.email || '-' }}</td>
              <td>{{ responsavel.telefone || '-' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-table {
      min-width: 0;
    }

    .link-button {
      appearance: none;
      border: 0;
      background: transparent;
      color: var(--app-primary);
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      padding: 0;
      text-align: left;
    }

    .link-button:hover {
      text-decoration: underline;
    }
  `],
})
class ResponsaveisFilialDialogComponent {
  readonly responsaveis = inject<ResponsavelFilial[]>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<ResponsaveisFilialDialogComponent>);

  abrirDetalhe(responsavel: ResponsavelFilial): void {
    this.dialogRef.close();
    this.dialog.open(DetalheResponsavelFilialDialogComponent, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: responsavel,
    });
  }
}

@Component({
  selector: 'app-detalhe-responsavel-filial-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Dados do representante</h2>
    <mat-dialog-content>
      <dl class="details">
        <div>
          <dt>Nome</dt>
          <dd>{{ responsavel.nome }}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{{ responsavel.email || '-' }}</dd>
        </div>
        <div>
          <dt>Telefone</dt>
          <dd class="phone">
            <span>{{ responsavel.telefone || '-' }}</span>
            @if (linkWhatsapp()) {
              <a
                mat-icon-button
                class="whatsapp-button"
                [href]="linkWhatsapp()"
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir WhatsApp Web"
              >
                <span class="material-symbols-outlined">chat</span>
              </a>
            }
          </dd>
        </div>
        <div>
          <dt>Filial</dt>
          <dd>{{ responsavel.filial }}</dd>
        </div>
      </dl>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .details {
      display: grid;
      gap: 10px;
      margin: 0;
    }

    .details div {
      display: grid;
      gap: 4px;
    }

    .details dt {
      color: var(--app-muted);
      font-size: 0.64rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .details dd {
      margin: 0;
      font-weight: 700;
      font-size: 0.78rem;
    }

    .phone {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .whatsapp-button {
      color: #128c4a;
    }
  `],
})
class DetalheResponsavelFilialDialogComponent {
  readonly responsavel = inject<ResponsavelFilial>(MAT_DIALOG_DATA);

  linkWhatsapp(): string | null {
    if (!this.responsavel.telefone) {
      return null;
    }

    let numero = this.responsavel.telefone.replace(/\D/g, '');
    if (numero.length === 10 || numero.length === 11) {
      numero = `55${numero}`;
    }

    return numero ? `https://web.whatsapp.com/send?phone=${numero}` : null;
  }
}
