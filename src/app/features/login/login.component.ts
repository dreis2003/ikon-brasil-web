import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <main class="login-page">
      <section class="identity">
        <img src="/assets/logo-ikon.png" alt="IKO Nakamura Brasil" />
        <h1>IKO Nakamura Brasil</h1>
        <p>Gestao nacional de filiados, filiais e processos administrativos.</p>
      </section>

      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Acessar plataforma</mat-card-title>
          <mat-card-subtitle>Entre com seu usuario institucional</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="entrar()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" autocomplete="username" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Senha</mat-label>
              <input matInput formControlName="senha" [type]="senhaVisivel() ? 'text' : 'password'" autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button" (click)="senhaVisivel.set(!senhaVisivel())">
                <span class="material-symbols-outlined">{{ senhaVisivel() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || carregando()">
              {{ carregando() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </main>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  readonly carregando = signal(false);
  readonly senhaVisivel = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  entrar(): void {
    if (this.form.invalid) {
      return;
    }
    this.carregando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: () => this.carregando.set(false),
    });
  }
}
