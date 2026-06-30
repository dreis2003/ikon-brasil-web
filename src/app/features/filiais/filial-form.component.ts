import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import { CepService } from '../../core/services/cep.service';
import { FiliaisService } from '../../core/services/filiais.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-filial-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ editando() ? 'Editar filial' : 'Nova filial' }}</h1>
          <p class="page-subtitle">
            {{ editando() ? 'Atualize os dados cadastrais da academia/dojo.' : 'Cadastre uma academia/dojo vinculado a IKO Nakamura Brasil.' }}
          </p>
        </div>
      </header>

      <form class="panel panel-pad grid-form" [formGroup]="form" (ngSubmit)="salvar()">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Codigo</mat-label>
          <input matInput formControlName="codigo" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Responsavel</mat-label>
          <input matInput formControlName="responsavel" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email do responsavel</mat-label>
          <input matInput type="email" formControlName="emailResponsavel" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="telefone" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>URL do logo da filial</mat-label>
          <input matInput formControlName="logoUrl" />
        </mat-form-field>

        <div class="preview full">
          <img [src]="form.controls.logoUrl.value || '/assets/logo-ikon.png'" alt="" />
          <span class="muted">Previa do logo da filial</span>
        </div>

        <div class="full section-title">Endereco</div>

        <mat-form-field appearance="outline">
          <mat-label>Cep</mat-label>
          <input matInput formControlName="cep" maxlength="9" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Logradouro</mat-label>
          <input matInput formControlName="logradouro" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Numero</mat-label>
          <input matInput formControlName="numero" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Complemento</mat-label>
          <input matInput formControlName="complemento" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Bairro</mat-label>
          <input matInput formControlName="bairro" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Cidade</mat-label>
          <input matInput formControlName="cidade" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <input matInput formControlName="estado" maxlength="2" />
        </mat-form-field>
        <div class="full actions">
          <a mat-button routerLink="/app/filiais">Cancelar</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Salvar</button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .preview {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .preview img {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      object-fit: contain;
      border: 1px solid var(--app-border);
      background: var(--app-surface-muted);
    }

    .section-title {
      color: var(--app-muted);
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `],
})
export class FilialFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly editando = signal(false);
  private filialId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    codigo: ['', [Validators.required, Validators.maxLength(40)]],
    responsavel: [''],
    emailResponsavel: ['', [Validators.email, Validators.maxLength(150)]],
    telefone: [''],
    logoUrl: [''],
    cep: [''],
    logradouro: [''],
    numero: [''],
    complemento: [''],
    bairro: [''],
    cidade: ['', [Validators.required, Validators.maxLength(100)]],
    estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
  });

  constructor(
    private readonly cepService: CepService,
    private readonly filiaisService: FiliaisService,
    private readonly notification: NotificationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.filialId = this.route.snapshot.paramMap.get('id');
    this.editando.set(!!this.filialId);

    if (this.filialId) {
      this.filiaisService.buscarPorId(this.filialId).subscribe((filial) => {
        this.form.patchValue({
          nome: filial.nome,
          codigo: filial.codigo,
          responsavel: filial.responsavel ?? '',
          emailResponsavel: filial.emailResponsavel ?? '',
          telefone: filial.telefone ?? '',
          logoUrl: filial.logoUrl ?? '',
          cep: filial.cep ?? '',
          logradouro: filial.logradouro ?? '',
          numero: filial.numero ?? '',
          complemento: filial.complemento ?? '',
          bairro: filial.bairro ?? '',
          cidade: filial.cidade,
          estado: filial.estado,
        });
      });
    }
    this.configurarBuscaCep();
  }

  salvar(): void {
    if (this.form.invalid) {
      return;
    }

    const request = this.form.getRawValue();
    const operacao = this.filialId
      ? this.filiaisService.atualizar(this.filialId, request)
      : this.filiaisService.criar(request);

    operacao.subscribe(() => {
      this.notification.sucesso(this.filialId ? 'Filial atualizada.' : 'Filial cadastrada.');
      this.router.navigate(['/app/filiais']);
    });
  }

  private configurarBuscaCep(): void {
    this.form.controls.cep.valueChanges.pipe(
      map((cep) => cep.replace(/\D/g, '')),
      filter((cep) => cep.length === 8),
      distinctUntilChanged(),
      debounceTime(250),
      switchMap((cep) => this.cepService.buscar(cep)),
    ).subscribe((endereco) => {
      this.form.patchValue({
        cep: endereco.cep ?? this.form.controls.cep.value,
        logradouro: endereco.logradouro ?? '',
        complemento: endereco.complemento ?? '',
        bairro: endereco.bairro ?? '',
        cidade: endereco.cidade ?? '',
        estado: endereco.estado ?? '',
      }, { emitEvent: false });
    });
  }
}
