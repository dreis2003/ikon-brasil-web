import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PerfilUsuario } from '../../core/models/auth.models';
import { Filial } from '../../core/models/cadastro.models';
import { FiliaisService } from '../../core/services/filiais.service';
import { NotificationService } from '../../core/services/notification.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { PerfilUsuarioPipe } from '../../shared/pipes/perfil-usuario.pipe';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, PerfilUsuarioPipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ editando() ? 'Editar usuario HONBU' : 'Novo usuario HONBU' }}</h1>
          <p class="page-subtitle">
            {{ editando() ? 'Altere dados, perfil, filial vinculada ou redefina a senha.' : 'Crie acessos administrativos da matriz ou usuarios vinculados a uma filial.' }}
          </p>
        </div>
      </header>

      <form class="panel panel-pad grid-form" [formGroup]="form" (ngSubmit)="salvar()">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="username" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="telefone" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ editando() ? 'Nova senha' : 'Senha inicial' }}</mat-label>
          <input matInput type="password" formControlName="senha" autocomplete="new-password" />
          @if (editando()) {
            <mat-hint>Deixe em branco para manter a senha atual.</mat-hint>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Perfil</mat-label>
          <mat-select formControlName="perfil">
            @for (perfil of perfis; track perfil) {
              <mat-option [value]="perfil">{{ perfil | perfilUsuario }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (perfilDeFilial()) {
          <mat-form-field appearance="outline" class="full">
            <mat-label>Filial</mat-label>
            <mat-select formControlName="filialId">
              @for (filial of filiais(); track filial.id) {
                <mat-option [value]="filial.id">{{ filial.codigo }} - {{ filial.nome }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        <div class="full hint">
          @if (perfilDeFilial()) {
            <span>Usuarios de filial recebem o claim filialId no token e so acessam dados da propria filial.</span>
          } @else {
            <span>Usuarios da HONBU nao devem possuir filial vinculada.</span>
          }
        </div>

        <div class="full actions">
          <a mat-button routerLink="/app/honbu/usuarios">Cancelar</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
            {{ editando() ? 'Salvar usuario' : 'Criar usuario' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .hint {
      color: var(--app-muted);
      font-weight: 600;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `],
})
export class UsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly perfis: PerfilUsuario[] = ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'];
  readonly filiais = signal<Filial[]>([]);
  readonly editando = signal(false);
  private usuarioId: string | null = null;
  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefone: ['', [Validators.maxLength(30)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    perfil: ['FILIAL_RESPONSAVEL' as PerfilUsuario, [Validators.required]],
    filialId: [''],
  });
  readonly perfilDeFilial = computed(() => this.form.controls.perfil.value.startsWith('FILIAL_'));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly filiaisService: FiliaisService,
    private readonly usuariosService: UsuariosService,
    private readonly notification: NotificationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.route.snapshot.paramMap.get('id');
    this.editando.set(!!this.usuarioId);
    if (this.usuarioId) {
      this.form.controls.senha.clearValidators();
      this.form.controls.senha.setValidators([Validators.minLength(8), Validators.maxLength(72)]);
      this.form.controls.senha.updateValueAndValidity();
    }

    this.filiaisService.listar().subscribe((filiais) => this.filiais.set(filiais));
    this.form.controls.perfil.valueChanges.subscribe((perfil) => {
      if (!perfil.startsWith('FILIAL_')) {
        this.form.controls.filialId.setValue('');
      }
    });

    if (this.usuarioId) {
      this.usuariosService.buscarPorId(this.usuarioId).subscribe((usuario) => {
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone ?? '',
          senha: '',
          perfil: usuario.perfil,
          filialId: usuario.filialId ?? '',
        });
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      return;
    }
    const valor = this.form.getRawValue();
    const request = {
      nome: valor.nome,
      email: valor.email,
      telefone: valor.telefone || null,
      senha: valor.senha || null,
      perfil: valor.perfil,
      filialId: valor.perfil.startsWith('FILIAL_') ? valor.filialId : null,
    };
    const operacao = this.usuarioId
      ? this.usuariosService.atualizar(this.usuarioId, request)
      : this.usuariosService.criar({ ...request, senha: valor.senha });

    operacao.subscribe(() => {
      this.notification.sucesso(this.usuarioId ? 'Usuario atualizado.' : 'Usuario criado.');
      this.router.navigate(['/app/honbu/usuarios']);
    });
  }
}
