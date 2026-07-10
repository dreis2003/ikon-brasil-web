import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { UsuarioSistema } from '../../../../../core/models/auth.models';
import { Filial } from '../../../../../core/models/cadastro.models';
import { FiliaisService } from '../../../../../core/services/filiais.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UsuariosService } from '../../../../../core/services/usuarios.service';
import { ExamesFaixaService } from '../../services/exames-faixa.service';

@Component({
  selector: 'app-exame-faixa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ exameId ? 'Editar exame de faixa' : 'Novo exame de faixa' }}</h1>
          <p class="page-subtitle">Configure inscrições, pagamentos, local e examinador.</p>
        </div>
      </header>

      <form class="panel panel-pad form-grid" [formGroup]="form" (ngSubmit)="salvar()">
        <mat-form-field class="full" appearance="outline">
          <mat-label>Nome do exame</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Filial responsável</mat-label>
          <mat-select formControlName="filialId">
            @for (filial of filiais(); track filial.id) {
              <mat-option [value]="filial.id">{{ filial.codigo }} - {{ filial.nome }}</mat-option>
            }
          </mat-select>
          @if (!ehHonbu()) {
            <mat-hint>Filial definida pelo usuário logado.</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Examinador</mat-label>
          <mat-select formControlName="examinadorId">
            @for (examinador of examinadores(); track examinador.id) {
              <mat-option [value]="examinador.id">{{ examinador.nome }} · {{ examinador.email }}</mat-option>
            }
          </mat-select>
          @if (examinadores().length === 0) {
            <mat-hint>Nenhum examinador disponível para seleção.</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Abertura das inscrições</mat-label>
          <input matInput type="date" formControlName="dataAberturaInscricoes" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Final de inscrição</mat-label>
          <input matInput type="date" formControlName="dataFinalInscricao" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Final pagamento inscrição</mat-label>
          <input matInput type="date" formControlName="dataFinalPagamentoInscricao" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Data do exame</mat-label>
          <input matInput type="date" formControlName="dataExame" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Final pagamento faixa/certificado</mat-label>
          <input matInput type="date" formControlName="dataFinalPagamentoFaixaCertificado" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Horário de início</mat-label>
          <input matInput type="time" formControlName="horarioInicio" />
        </mat-form-field>

        <mat-form-field class="full" appearance="outline">
          <mat-label>Local do exame</mat-label>
          <input matInput formControlName="local" />
        </mat-form-field>

        <mat-form-field class="full" appearance="outline">
          <mat-label>Observações</mat-label>
          <textarea matInput formControlName="observacoes" rows="3"></textarea>
        </mat-form-field>

        @if (erroDatas) {
          <div class="validation-error full">{{ erroDatas }}</div>
        }

        <div class="form-actions full">
          <a mat-button routerLink="/app/graduacoes/exames">Cancelar</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Salvar</button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .full { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .validation-error { color: var(--app-danger); font-weight: 750; }
    @media (max-width: 760px) { .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class ExameFaixaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examesService = inject(ExamesFaixaService);
  private readonly filiaisService = inject(FiliaisService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly exameId = this.route.snapshot.paramMap.get('id');
  readonly filiais = signal<Filial[]>([]);
  readonly examinadores = signal<UsuarioSistema[]>([]);
  erroDatas = '';

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    filialId: [this.auth.usuario()?.filialId ?? '', [Validators.required]],
    dataAberturaInscricoes: ['', [Validators.required]],
    dataFinalInscricao: ['', [Validators.required]],
    dataFinalPagamentoInscricao: ['', [Validators.required]],
    dataExame: ['', [Validators.required]],
    dataFinalPagamentoFaixaCertificado: ['', [Validators.required]],
    examinadorId: ['', [Validators.required]],
    local: ['', [Validators.required]],
    horarioInicio: ['09:00', [Validators.required]],
    observacoes: [''],
  });

  ngOnInit(): void {
    this.carregarFiliais();
    this.carregarExaminadores();
    if (this.exameId) {
      this.examesService.buscar(this.exameId).subscribe((exame) => this.form.patchValue({
        nome: exame.nome,
        filialId: exame.filialId,
        dataAberturaInscricoes: exame.dataAberturaInscricoes,
        dataFinalInscricao: exame.dataFinalInscricao,
        dataFinalPagamentoInscricao: exame.dataFinalPagamentoInscricao,
        dataExame: exame.dataExame,
        dataFinalPagamentoFaixaCertificado: exame.dataFinalPagamentoFaixaCertificado,
        examinadorId: exame.examinadorId,
        local: exame.local ?? '',
        horarioInicio: exame.horarioInicio ?? '09:00',
        observacoes: exame.observacoes ?? '',
      }));
    }
  }

  ehHonbu(): boolean {
    const perfil = this.auth.usuario()?.perfil;
    return perfil === 'MATRIZ_ADMIN' || perfil === 'MATRIZ_OPERADOR';
  }

  salvar(): void {
    if (this.form.invalid || !this.validarIds() || !this.validarDatas()) {
      return;
    }
    const valor = this.form.getRawValue();
    const request = {
      ...valor,
      observacoes: valor.observacoes || null,
    };
    const operacao = this.exameId
      ? this.examesService.atualizar(this.exameId, request)
      : this.examesService.criar(request);

    operacao.subscribe((exame) => {
      this.notification.sucesso(this.exameId ? 'Exame atualizado.' : 'Exame criado.');
      this.router.navigate(['/app/graduacoes/exames', exame.id]);
    });
  }

  private validarDatas(): boolean {
    const v = this.form.getRawValue();
    this.erroDatas = '';
    if (v.dataAberturaInscricoes > v.dataFinalInscricao) this.erroDatas = 'Abertura das inscrições não pode ser posterior ao fim.';
    else if (v.dataFinalInscricao > v.dataExame) this.erroDatas = 'Final de inscrição não pode ser posterior ao exame.';
    else if (v.dataFinalPagamentoInscricao > v.dataExame) this.erroDatas = 'Pagamento da inscrição não pode ser posterior ao exame.';
    else if (v.dataFinalPagamentoFaixaCertificado < v.dataExame) this.erroDatas = 'Pagamento de faixa/certificado deve ser igual ou posterior ao exame.';
    return !this.erroDatas;
  }

  private validarIds(): boolean {
    const { filialId, examinadorId } = this.form.getRawValue();
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    this.erroDatas = '';
    if (!uuid.test(filialId)) {
      this.erroDatas = 'Selecione uma filial válida.';
    } else if (!uuid.test(examinadorId)) {
      this.erroDatas = 'Selecione um examinador válido.';
    }
    return !this.erroDatas;
  }

  private carregarFiliais(): void {
    const usuario = this.auth.usuario();
    if (this.ehHonbu()) {
      this.filiaisService.listar().subscribe({
        next: (filiais) => this.filiais.set(filiais),
        error: () => this.notification.erro('Não foi possível carregar as filiais.'),
      });
      return;
    }

    if (!usuario?.filialId) {
      this.notification.erro('Usuário logado não possui filial vinculada.');
      return;
    }

    this.form.controls.filialId.disable();
    this.filiaisService.buscarPorId(usuario.filialId).subscribe({
      next: (filial) => {
        this.filiais.set([filial]);
        this.form.controls.filialId.setValue(filial.id);
      },
      error: () => this.notification.erro('Não foi possível carregar a filial vinculada ao usuário.'),
    });
  }

  private carregarExaminadores(): void {
    if (!this.ehHonbu()) {
      const usuario = this.auth.usuario();
      if (!usuario) return;
      const examinador: UsuarioSistema = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        filialId: usuario.filialId,
        status: 'ATIVO',
        permissoes: usuario.permissoes,
        dataCadastro: '',
      };
      this.examinadores.set([examinador]);
      this.form.controls.examinadorId.setValue(usuario.id);
      return;
    }

    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        const examinadores = usuarios.filter((usuario) =>
          usuario.status === 'ATIVO'
          && (usuario.perfil === 'FILIAL_PROFESSOR' || usuario.perfil === 'FILIAL_RESPONSAVEL')
        );
        this.examinadores.set(examinadores);
        if (!this.form.controls.examinadorId.value && examinadores.length === 1) {
          this.form.controls.examinadorId.setValue(examinadores[0].id);
        }
      },
      error: () => this.notification.erro('Não foi possível carregar os examinadores.'),
    });
  }
}
