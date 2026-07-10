import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { startWith } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { GraduacaoOficial, SalvarGraduacaoOficialRequest, TipoGraduacao } from '../../models/graduacao-oficial.models';
import { GraduacoesOficiaisService } from '../../services/graduacoes-oficiais.service';

@Component({
  selector: 'app-tabela-oficial-graduacoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  template: `
    <section class="page graduacoes-table-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Tabela Oficial de Graduações</h1>
          <p class="page-subtitle">Cadastro técnico das graduações oficiais, ordem de progressão e status de uso.</p>
        </div>
        <button mat-flat-button color="primary" type="button" (click)="abrirFormulario()">
          <span class="material-symbols-outlined">add</span>
          Nova graduação
        </button>
      </header>

      <section class="summary-grid" aria-label="Resumo da tabela oficial">
        <div class="summary-item">
          <span class="material-symbols-outlined">military_tech</span>
          <div><strong>{{ graduacoes().length }}</strong><span>Total</span></div>
        </div>
        <div class="summary-item">
          <span class="material-symbols-outlined">format_list_numbered</span>
          <div><strong>{{ totalKyu() }}</strong><span>Kyus</span></div>
        </div>
        <div class="summary-item">
          <span class="material-symbols-outlined">workspace_premium</span>
          <div><strong>{{ totalDan() }}</strong><span>Dans</span></div>
        </div>
        <div class="summary-item">
          <span class="material-symbols-outlined">child_care</span>
          <div><strong>{{ totalInfantil() }}</strong><span>Infantil</span></div>
        </div>
      </section>

      <section class="panel">
        <div class="toolbar">
          <mat-form-field appearance="outline">
            <mat-label>Tipo</mat-label>
            <mat-select [formControl]="tipoControl">
              <mat-option value="">Todos</mat-option>
              <mat-option value="KYU">Kyu</mat-option>
              <mat-option value="DAN">Dan</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Cor da faixa</mat-label>
            <mat-select [formControl]="corControl">
              <mat-option value="">Todas</mat-option>
              @for (cor of cores(); track cor) {
                <mat-option [value]="cor">{{ cor }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusControl">
              <mat-option value="">Todos</mat-option>
              <mat-option value="ATIVA">Ativas</mat-option>
              <mat-option value="INATIVA">Inativas</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="search-field" appearance="outline">
            <mat-label>Pesquisa rápida</mat-label>
            <input matInput [formControl]="pesquisaControl" placeholder="Nome, cor ou tipo" />
            <span matSuffix class="material-symbols-outlined">search</span>
          </mat-form-field>
        </div>

        <div class="table-wrap">
          <table class="data-table graduacoes-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Graduação</th>
                <th>Cor</th>
                <th>Tipo</th>
                <th>Kyu/Dan</th>
                <th>Infantil</th>
                <th>Status</th>
                <th class="actions-column">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (graduacao of graduacoesFiltradas(); track graduacao.id) {
                <tr>
                  <td><strong>{{ graduacao.ordemTecnica }}</strong></td>
                  <td>
                    <strong>{{ graduacao.nome }}</strong>
                    <div class="muted">Ordem da cor {{ graduacao.ordemCor }}</div>
                  </td>
                  <td>
                    <span class="belt-color">
                      <span class="belt-swatch" [style.background]="corCss(graduacao.corFaixa)"></span>
                      {{ graduacao.corFaixa }}
                    </span>
                  </td>
                  <td>{{ graduacao.tipo }}</td>
                  <td>{{ graduacao.tipo === 'KYU' ? graduacao.kyu + 'º Kyu' : graduacao.dan + 'º Dan' }}</td>
                  <td>{{ graduacao.infantil ? 'Sim' : 'Não' }}</td>
                  <td>
                    <span class="status-pill" [class.inactive]="!graduacao.ativa">
                      {{ graduacao.ativa ? 'Ativa' : 'Inativa' }}
                    </span>
                  </td>
                  <td class="actions-column">
                    <div class="row-actions">
                      <button mat-icon-button type="button" (click)="abrirFormulario(graduacao)" matTooltip="Editar">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      @if (graduacao.ativa) {
                        <button mat-icon-button type="button" (click)="inativar(graduacao)" matTooltip="Inativar">
                          <span class="material-symbols-outlined">block</span>
                        </button>
                      } @else {
                        <button mat-icon-button type="button" (click)="ativar(graduacao)" matTooltip="Ativar">
                          <span class="material-symbols-outlined">check_circle</span>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">Nenhuma graduação encontrada.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styleUrl: './tabela-oficial-graduacoes.component.scss',
})
export class TabelaOficialGraduacoesComponent implements OnInit {
  readonly graduacoes = signal<GraduacaoOficial[]>([]);

  readonly tipoControl = new FormControl<TipoGraduacao | ''>('', { nonNullable: true });
  readonly corControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl<'ATIVA' | 'INATIVA' | ''>('', { nonNullable: true });
  readonly pesquisaControl = new FormControl('', { nonNullable: true });

  private readonly tipoFiltro = toSignal(this.tipoControl.valueChanges.pipe(startWith(this.tipoControl.value)), { initialValue: '' as TipoGraduacao | '' });
  private readonly corFiltro = toSignal(this.corControl.valueChanges.pipe(startWith(this.corControl.value)), { initialValue: '' });
  private readonly statusFiltro = toSignal(this.statusControl.valueChanges.pipe(startWith(this.statusControl.value)), { initialValue: '' as 'ATIVA' | 'INATIVA' | '' });
  private readonly pesquisaFiltro = toSignal(this.pesquisaControl.valueChanges.pipe(startWith(this.pesquisaControl.value)), { initialValue: '' });

  readonly cores = computed(() => [...new Set(this.graduacoes().map((graduacao) => graduacao.corFaixa))].sort());
  readonly totalKyu = computed(() => this.graduacoes().filter((graduacao) => graduacao.tipo === 'KYU').length);
  readonly totalDan = computed(() => this.graduacoes().filter((graduacao) => graduacao.tipo === 'DAN').length);
  readonly totalInfantil = computed(() => this.graduacoes().filter((graduacao) => graduacao.infantil).length);

  readonly graduacoesFiltradas = computed(() => {
    const tipo = this.tipoFiltro();
    const cor = this.corFiltro();
    const status = this.statusFiltro();
    const pesquisa = this.pesquisaFiltro().trim().toLocaleLowerCase();

    return this.graduacoes().filter((graduacao) => {
      const texto = `${graduacao.nome} ${graduacao.corFaixa} ${graduacao.tipo}`.toLocaleLowerCase();
      return (!tipo || graduacao.tipo === tipo)
        && (!cor || graduacao.corFaixa === cor)
        && (!status || (status === 'ATIVA' ? graduacao.ativa : !graduacao.ativa))
        && (!pesquisa || texto.includes(pesquisa));
    });
  });

  constructor(
    private readonly graduacoesService: GraduacoesOficiaisService,
    private readonly notification: NotificationService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  abrirFormulario(graduacao?: GraduacaoOficial): void {
    const dialogRef = this.dialog.open(FormularioGraduacaoOficialDialogComponent, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      data: graduacao ?? null,
    });

    dialogRef.afterClosed().subscribe((request: SalvarGraduacaoOficialRequest | undefined) => {
      if (!request) {
        return;
      }

      const operacao = graduacao
        ? this.graduacoesService.atualizar(graduacao.id, request)
        : this.graduacoesService.criar(request);

      operacao.subscribe(() => {
        this.notification.sucesso(graduacao ? 'Graduação atualizada.' : 'Graduação cadastrada.');
        this.carregar();
      });
    });
  }

  ativar(graduacao: GraduacaoOficial): void {
    this.graduacoesService.ativar(graduacao.id).subscribe(() => {
      this.notification.sucesso('Graduação ativada.');
      this.carregar();
    });
  }

  inativar(graduacao: GraduacaoOficial): void {
    this.graduacoesService.inativar(graduacao.id).subscribe(() => {
      this.notification.sucesso('Graduação inativada.');
      this.carregar();
    });
  }

  corCss(cor: string): string {
    const cores: Record<string, string> = {
      BRANCA: '#ffffff',
      VERMELHA: '#c62828',
      LARANJA: '#f57c00',
      AZUL: '#1565c0',
      AMARELA: '#f9c74f',
      VERDE: '#2e7d32',
      MARROM: '#6d4c41',
      PRETA: '#111111',
    };
    return cores[cor.toUpperCase()] ?? 'var(--app-muted)';
  }

  private carregar(): void {
    this.graduacoesService.listar().subscribe((graduacoes) => {
      this.graduacoes.set([...graduacoes].sort((a, b) => a.ordemTecnica - b.ordemTecnica));
    });
  }
}

interface FormularioGraduacaoForm {
  nome: FormControl<string>;
  corFaixa: FormControl<string>;
  tipo: FormControl<TipoGraduacao>;
  kyu: FormControl<number | null>;
  dan: FormControl<number | null>;
  ordemCor: FormControl<number>;
  ordemTecnica: FormControl<number>;
  infantil: FormControl<boolean>;
  ativa: FormControl<boolean>;
}

@Component({
  selector: 'app-formulario-graduacao-oficial-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar graduação oficial' : 'Nova graduação oficial' }}</h2>
    <mat-dialog-content>
      <form class="dialog-form" [formGroup]="form">
        <mat-form-field class="full" appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" placeholder="Ex.: 10º Kyu - Faixa Laranja" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cor da faixa</mat-label>
          <input matInput formControlName="corFaixa" placeholder="Ex.: LARANJA" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo" (selectionChange)="ajustarTipo()">
            <mat-option value="KYU">Kyu</mat-option>
            <mat-option value="DAN">Dan</mat-option>
          </mat-select>
        </mat-form-field>

        @if (form.controls.tipo.value === 'KYU') {
          <mat-form-field appearance="outline">
            <mat-label>Kyu</mat-label>
            <input matInput type="number" formControlName="kyu" />
          </mat-form-field>
        } @else {
          <mat-form-field appearance="outline">
            <mat-label>Dan</mat-label>
            <input matInput type="number" formControlName="dan" />
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>Ordem da cor</mat-label>
          <input matInput type="number" formControlName="ordemCor" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ordem técnica</mat-label>
          <input matInput type="number" formControlName="ordemTecnica" />
        </mat-form-field>

        <div class="toggles full">
          <mat-slide-toggle formControlName="infantil">Graduação infantil</mat-slide-toggle>
          <mat-slide-toggle formControlName="ativa">Ativa</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="salvar()">Salvar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      padding-top: 4px;
    }

    .full {
      grid-column: 1 / -1;
    }

    .toggles {
      display: flex;
      gap: 20px;
      align-items: center;
      min-height: 40px;
    }

    @media (max-width: 640px) {
      .dialog-form {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class FormularioGraduacaoOficialDialogComponent {
  readonly form: FormGroup<FormularioGraduacaoForm>;

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly dialogRef: MatDialogRef<FormularioGraduacaoOficialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: GraduacaoOficial | null,
  ) {
    this.form = this.fb.group({
      nome: this.fb.control(data?.nome ?? '', [Validators.required]),
      corFaixa: this.fb.control(data?.corFaixa ?? '', [Validators.required]),
      tipo: this.fb.control<TipoGraduacao>(data?.tipo ?? 'KYU', [Validators.required]),
      kyu: new FormControl<number | null>(data?.kyu ?? 11),
      dan: new FormControl<number | null>(data?.dan ?? null),
      ordemCor: this.fb.control(data?.ordemCor ?? 1, [Validators.required, Validators.min(1)]),
      ordemTecnica: this.fb.control(data?.ordemTecnica ?? 1, [Validators.required, Validators.min(1)]),
      infantil: this.fb.control(data?.infantil ?? false),
      ativa: this.fb.control(data?.ativa ?? true),
    });
    this.ajustarTipo();
  }

  ajustarTipo(): void {
    if (this.form.controls.tipo.value === 'KYU') {
      this.form.controls.dan.setValue(null);
      this.form.controls.kyu.addValidators([Validators.required, Validators.min(1)]);
      this.form.controls.dan.clearValidators();
    } else {
      this.form.controls.kyu.setValue(null);
      this.form.controls.dan.addValidators([Validators.required, Validators.min(1)]);
      this.form.controls.kyu.clearValidators();
    }
    this.form.controls.kyu.updateValueAndValidity();
    this.form.controls.dan.updateValueAndValidity();
  }

  salvar(): void {
    if (this.form.invalid) {
      return;
    }

    const valor = this.form.getRawValue();
    this.dialogRef.close({
      nome: valor.nome.trim(),
      corFaixa: valor.corFaixa.trim().toUpperCase(),
      tipo: valor.tipo,
      kyu: valor.tipo === 'KYU' ? valor.kyu : null,
      dan: valor.tipo === 'DAN' ? valor.dan : null,
      ordemCor: Number(valor.ordemCor),
      ordemTecnica: Number(valor.ordemTecnica),
      infantil: valor.infantil,
      ativa: valor.ativa,
    } satisfies SalvarGraduacaoOficialRequest);
  }
}
