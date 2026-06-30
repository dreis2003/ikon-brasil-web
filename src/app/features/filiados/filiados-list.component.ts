import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Filial, Filiado } from '../../core/models/cadastro.models';
import { FiliadosService } from '../../core/services/filiados.service';
import { FiliaisService } from '../../core/services/filiais.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';

@Component({
  selector: 'app-filiados-list',
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, StatusBadgeComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Filiados</h1>
          <p class="page-subtitle">Consulta e manutencao do cadastro nacional de membros.</p>
        </div>
        @if (auth.possuiPermissao(['FILIADO_CRIAR'])) {
          <a mat-flat-button color="primary" routerLink="/app/filiados/novo">
            <span class="material-symbols-outlined">person_add</span>
            Novo filiado
          </a>
        }
      </header>

      <div class="panel panel-pad filters">
        @if (linkAutocadastro()) {
          <div class="self-register">
            <div>
              <strong>Link de autocadastro</strong>
              <span>Envie este link para futuros filiados preencherem o cadastro publico da sua filial.</span>
              <code>{{ linkAutocadastro() }}</code>
            </div>
            <div class="self-register-actions">
              <a class="copy-link-button" [href]="linkAutocadastro()" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-outlined">open_in_new</span>
                Abrir formulario
              </a>
              <button class="copy-link-button" type="button" (click)="copiarLinkAutocadastro()">
                <span class="material-symbols-outlined">content_copy</span>
                Copiar link
              </button>
            </div>
          </div>
        }
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
                  <button class="person person-button" type="button" (click)="abrirDetalhes(filiado)">
                    <img [src]="filiado.fotoPerfilUrl || '/assets/logo-ikon.png'" alt="" />
                    <div>
                      <strong>{{ filiado.nomeCompleto }}</strong>
                      <span>{{ filiado.numeroInternacional ? 'Member Card: ' + filiado.numeroInternacional : 'Sem Member Card' }}</span>
                    </div>
                  </button>
                </td>
                <td>{{ nomeFilial(filiado.filialId) }}</td>
                <td>{{ filiado.email || '-' }}</td>
                <td><app-status-badge [status]="filiado.status" /></td>
                <td class="actions-column">
                  <div class="row-actions">
                    <a mat-icon-button [routerLink]="['/app/filiados', filiado.id]" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </a>
                    @if (auth.possuiPermissao(['FILIADO_EDITAR']) && filiado.status === 'INATIVO') {
                      <button mat-icon-button (click)="ativar(filiado)" title="Ativar">
                        <span class="material-symbols-outlined">check_circle</span>
                      </button>
                    }
                    @if (auth.possuiPermissao(['FILIADO_INATIVAR']) && filiado.status === 'ATIVO') {
                      <button mat-icon-button (click)="inativar(filiado)" title="Inativar">
                        <span class="material-symbols-outlined">block</span>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">Nenhum filiado encontrado.</td></tr>
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
      display: grid;
      gap: 10px;
      padding-bottom: 0;
    }

    .filters mat-form-field {
      width: min(520px, 100%);
    }

    .self-register {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-surface-muted);
      padding: 8px 10px;
    }

    .copy-link-button {
      appearance: none;
      min-width: 102px;
      height: 30px;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-surface);
      color: var(--app-text);
      cursor: pointer;
      font: inherit;
      font-size: 0.72rem;
      font-weight: 750;
      line-height: 30px;
      padding: 0 8px;
      white-space: nowrap;
      text-decoration: none;
    }

    .self-register-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
    }

    .copy-link-button .material-symbols-outlined {
      font-size: 15px;
      line-height: 1;
    }

    .copy-link-button:hover {
      border-color: var(--app-primary);
      color: var(--app-primary);
      background: color-mix(in srgb, var(--app-primary) 7%, var(--app-surface));
    }

    .copy-link-button:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--app-primary) 45%, transparent);
      outline-offset: 2px;
    }

    .self-register strong,
    .self-register span,
    .self-register code {
      display: block;
    }

    .self-register strong {
      color: var(--app-text);
      font-size: 0.82rem;
    }

    .self-register span {
      color: var(--app-muted);
      font-size: 0.72rem;
      margin: 2px 0 5px;
    }

    .self-register code {
      color: var(--app-text);
      font-size: 0.68rem;
      overflow-wrap: anywhere;
    }

    @media (max-width: 720px) {
      .self-register {
        align-items: stretch;
        flex-direction: column;
      }

      .copy-link-button {
        width: 100%;
      }

      .self-register-actions {
        flex-direction: column;
        width: 100%;
      }
    }

    .person {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .person-button {
      width: 100%;
      border: 0;
      padding: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      text-align: left;
    }

    .person-button:hover strong {
      color: var(--app-primary);
      text-decoration: underline;
    }

    .person img {
      width: 34px;
      height: 34px;
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
      font-size: 0.74rem;
    }
  `],
})
export class FiliadosListComponent implements OnInit {
  readonly filiados = signal<Filiado[]>([]);
  private readonly filiaisPorId = signal<Map<string, Filial>>(new Map());
  readonly busca = signal('');
  readonly linkAutocadastro = computed(() => {
    const filialId = this.auth.usuario()?.filialId;
    return filialId ? `${window.location.origin}/autocadastro/${filialId}` : null;
  });
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
    private readonly notification: NotificationService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  ativar(filiado: Filiado): void {
    this.filiadosService.ativar(filiado.id).subscribe(() => {
      this.notification.sucesso('Filiado ativado.');
      this.carregar();
    });
  }

  inativar(filiado: Filiado): void {
    this.filiadosService.inativar(filiado.id).subscribe(() => {
      this.notification.sucesso('Filiado inativado.');
      this.carregar();
    });
  }

  copiarLinkAutocadastro(): void {
    const link = this.linkAutocadastro();
    if (!link) {
      return;
    }
    navigator.clipboard.writeText(link).then(() => {
      this.notification.sucesso('Link de autocadastro copiado.');
    });
  }

  abrirDetalhes(filiado: Filiado): void {
    this.dialog.open(DetalheFiliadoDialogComponent, {
      width: '760px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        filiado,
        filial: this.nomeFilial(filiado.filialId),
      } satisfies DetalheFiliadoDialogData,
    });
  }

  nomeFilial(filialId: string): string {
    const filial = this.filiaisPorId().get(filialId);
    return filial ? `${filial.codigo} - ${filial.nome}` : filialId;
  }

  private carregar(): void {
    this.filiadosService.listar().subscribe((filiados) => {
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

interface DetalheFiliadoDialogData {
  filiado: Filiado;
  filial: string;
}

@Component({
  selector: 'app-detalhe-filiado-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, StatusBadgeComponent, DataBrPipe],
  template: `
    <h2 mat-dialog-title>Dados do filiado</h2>
    <mat-dialog-content>
      <div class="profile">
        <img [src]="data.filiado.fotoPerfilUrl || '/assets/logo-ikon.png'" alt="" />
        <div>
          <div class="profile-name">
            <strong>{{ data.filiado.nomeCompleto }}</strong>
            @if (linkWhatsapp()) {
              <a
                mat-icon-button
                class="whatsapp-button"
                [href]="linkWhatsapp()"
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir WhatsApp Web"
              >
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M16.02 3.2c-7.05 0-12.78 5.71-12.78 12.75 0 2.25.59 4.45 1.71 6.39L3.14 28.8l6.62-1.74a12.73 12.73 0 0 0 6.26 1.64c7.04 0 12.77-5.72 12.77-12.75S23.06 3.2 16.02 3.2Zm0 23.35c-1.95 0-3.85-.53-5.5-1.54l-.39-.23-3.92 1.03 1.05-3.82-.25-.4a10.54 10.54 0 0 1-1.62-5.64c0-5.85 4.77-10.6 10.63-10.6s10.62 4.75 10.62 10.6-4.76 10.6-10.62 10.6Zm5.82-7.94c-.32-.16-1.88-.93-2.17-1.04-.29-.1-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66s1.14 3.08 1.3 3.29c.16.21 2.25 3.44 5.45 4.82.76.33 1.35.52 1.82.67.76.24 1.46.21 2 .13.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
                </svg>
              </a>
            }
          </div>
          <span>{{ data.filiado.numeroInternacional ? 'Member Card: ' + data.filiado.numeroInternacional : 'Sem Member Card' }}</span>
          <app-status-badge [status]="data.filiado.status" />
        </div>
      </div>

      <section class="detail-section">
        <h3>Dados pessoais</h3>
        <dl class="details-grid">
          <div><dt>Nome social</dt><dd>{{ data.filiado.nomeSocial || '-' }}</dd></div>
          <div><dt>Nascimento</dt><dd>{{ data.filiado.dataNascimento | dataBr }}</dd></div>
          <div><dt>Sexo</dt><dd>{{ sexo(data.filiado.sexo) }}</dd></div>
          <div><dt>CPF</dt><dd>{{ data.filiado.cpf || '-' }}</dd></div>
          <div><dt>Nacionalidade</dt><dd>{{ data.filiado.nacionalidade || '-' }}</dd></div>
          <div><dt>Naturalidade</dt><dd>{{ data.filiado.naturalidade || '-' }}</dd></div>
          <div><dt>Profissao</dt><dd>{{ data.filiado.profissao || '-' }}</dd></div>
          <div><dt>Tipo sanguineo</dt><dd>{{ data.filiado.tipoSanguineo || '-' }}</dd></div>
          <div><dt>Aluno desde</dt><dd>{{ data.filiado.dataInicioTreinamento | dataBr }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>Contato e filial</h3>
        <dl class="details-grid">
          <div><dt>Email</dt><dd>{{ data.filiado.email || '-' }}</dd></div>
          <div><dt>Telefone</dt><dd>{{ data.filiado.telefone || '-' }}</dd></div>
          <div class="span-2"><dt>Filial</dt><dd>{{ data.filial }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>Endereco</h3>
        <dl class="details-grid">
          <div class="span-2"><dt>Logradouro</dt><dd>{{ data.filiado.endereco?.logradouro || '-' }}</dd></div>
          <div><dt>Numero</dt><dd>{{ data.filiado.endereco?.numero || '-' }}</dd></div>
          <div><dt>Complemento</dt><dd>{{ data.filiado.endereco?.complemento || '-' }}</dd></div>
          <div><dt>Bairro</dt><dd>{{ data.filiado.endereco?.bairro || '-' }}</dd></div>
          <div><dt>Cidade</dt><dd>{{ data.filiado.endereco?.cidade || '-' }}</dd></div>
          <div><dt>UF</dt><dd>{{ data.filiado.endereco?.estado || '-' }}</dd></div>
          <div><dt>CEP</dt><dd>{{ data.filiado.endereco?.cep || '-' }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>Responsavel legal</h3>
        <dl class="details-grid">
          <div class="span-2"><dt>Nome</dt><dd>{{ data.filiado.responsavelNome || '-' }}</dd></div>
          <div><dt>Parentesco</dt><dd>{{ data.filiado.responsavelParentesco || '-' }}</dd></div>
          <div><dt>CPF</dt><dd>{{ data.filiado.responsavelCpf || '-' }}</dd></div>
          <div><dt>Telefone</dt><dd>{{ data.filiado.responsavelTelefone || '-' }}</dd></div>
          <div><dt>Email</dt><dd>{{ data.filiado.responsavelEmail || '-' }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>Saude e PAR-Q</h3>
        <dl class="details-grid">
          <div class="span-3"><dt>Dados medicos</dt><dd>{{ data.filiado.dadosMedicos || '-' }}</dd></div>
          <div><dt>PAR-Q 1</dt><dd>{{ simNao(data.filiado.parqPergunta1) }}</dd></div>
          <div><dt>PAR-Q 2</dt><dd>{{ simNao(data.filiado.parqPergunta2) }}</dd></div>
          <div><dt>PAR-Q 3</dt><dd>{{ simNao(data.filiado.parqPergunta3) }}</dd></div>
          <div><dt>PAR-Q 4</dt><dd>{{ simNao(data.filiado.parqPergunta4) }}</dd></div>
          <div><dt>PAR-Q 5</dt><dd>{{ simNao(data.filiado.parqPergunta5) }}</dd></div>
          <div><dt>PAR-Q 6</dt><dd>{{ simNao(data.filiado.parqPergunta6) }}</dd></div>
          <div><dt>PAR-Q 7</dt><dd>{{ simNao(data.filiado.parqPergunta7) }}</dd></div>
          <div class="span-2"><dt>Assinatura</dt><dd>{{ data.filiado.assinaturaNome || '-' }}</dd></div>
          <div><dt>Aceite</dt><dd>{{ data.filiado.declaracaoSaudeAceite ? 'Confirmado' : '-' }}</dd></div>
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
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--app-border);
      background: var(--app-surface-muted);
    }

    .profile strong,
    .profile span {
      display: block;
    }

    .profile-name {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }

    .profile strong {
      color: var(--app-text);
      font-size: 0.95rem;
    }

    .whatsapp-button {
      width: 30px;
      height: 30px;
      min-width: 30px;
      padding: 0;
      color: #128c4a;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      vertical-align: middle;
    }

    .whatsapp-button svg {
      width: 21px;
      height: 21px;
      fill: currentColor;
      display: block;
      margin: auto;
      flex: 0 0 auto;
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

    .details-grid div {
      min-width: 0;
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
class DetalheFiliadoDialogComponent {
  readonly data = inject<DetalheFiliadoDialogData>(MAT_DIALOG_DATA);

  sexo(valor: string): string {
    const labels: Record<string, string> = {
      FEMININO: 'Feminino',
      MASCULINO: 'Masculino',
      NAO_INFORMADO: 'Nao informado',
    };
    return labels[valor] || valor || '-';
  }

  simNao(valor: boolean | null | undefined): string {
    return valor ? 'Sim' : 'Nao';
  }

  linkWhatsapp(): string | null {
    if (!this.data.filiado.telefone) {
      return null;
    }

    let numero = this.data.filiado.telefone.replace(/\D/g, '');
    if (numero.length === 10 || numero.length === 11) {
      numero = `55${numero}`;
    }

    return numero ? `https://web.whatsapp.com/send?phone=${numero}` : null;
  }
}
