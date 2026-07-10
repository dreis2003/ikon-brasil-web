import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { GraduacaoOficial } from '../../../models/graduacao-oficial.models';
import { montarOpcoesGraduacaoPretendida } from '../../../models/opcao-graduacao-pretendida.models';
import { GraduacoesOficiaisService } from '../../../services/graduacoes-oficiais.service';
import { ExameFaixa, ValidarCpfInscricaoResponse } from '../../models/exames-faixa.models';
import { InscricaoPublicaExameService } from '../../services/inscricao-publica-exame.service';

@Component({
  selector: 'app-inscricao-publica-exame',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <main class="public-page">
      <section class="public-shell">
        <header>
          <img src="/assets/logo-ikon.png" alt="IKO Nakamura Brasil" />
          <div>
            <h1>Inscrição para Exame de Faixa</h1>
            @if (exame(); as exame) {
              <p>{{ exame.nome }} · {{ exame.dataExame | date:'dd/MM/yyyy' }}</p>
            }
          </div>
        </header>

        @if (sucesso()) {
          <section class="success">
            <span class="material-symbols-outlined">check_circle</span>
            <h2>Inscrição recebida</h2>
            <p>Sua inscrição foi recebida e está aguardando confirmação de pagamento.</p>
          </section>
        } @else if (!filiado()) {
          <form class="panel panel-pad cpf-step" [formGroup]="cpfForm" (ngSubmit)="validarCpf()">
            <h2>Informe seu CPF</h2>
            <p class="muted">Validaremos apenas se você está apto a se inscrever neste exame.</p>
            <mat-form-field appearance="outline">
              <mat-label>CPF</mat-label>
              <input matInput formControlName="cpf" autocomplete="off" />
            </mat-form-field>
            @if (erro()) {
              <div class="error">{{ erro() }}</div>
            }
            <button mat-flat-button color="primary" type="submit" [disabled]="cpfForm.invalid || carregando()">Continuar</button>
          </form>
        } @else {
          <form class="panel panel-pad form-grid" [formGroup]="inscricaoForm" (ngSubmit)="inscrever()">
            <section class="full info-block">
              <h2>Dados do exame</h2>
              @if (exame(); as exame) {
                <dl>
                  <div><dt>Local</dt><dd>{{ exame.local }}</dd></div>
                  <div><dt>Horário</dt><dd>{{ exame.horarioInicio }}</dd></div>
                  <div><dt>Final inscrição</dt><dd>{{ exame.dataFinalInscricao | date:'dd/MM/yyyy' }}</dd></div>
                </dl>
              }
            </section>

            <section class="full info-block">
              <h2>Dados do filiado</h2>
              @if (filiado(); as filiado) {
                <dl>
                  <div><dt>Nome</dt><dd>{{ filiado.nome }}</dd></div>
                  <div><dt>Nascimento</dt><dd>{{ filiado.dataNascimento ? (filiado.dataNascimento | date:'dd/MM/yyyy') : 'Não informado' }}</dd></div>
                  <div><dt>Faixa atual</dt><dd>{{ filiado.graduacaoAtualNome || 'Não informada' }}</dd></div>
                  <div><dt>Nº internacional</dt><dd>{{ filiado.numeroInternacional || 'Não informado' }}</dd></div>
                </dl>
              }
            </section>

            <mat-form-field appearance="outline">
              <mat-label>Graduação pretendida</mat-label>
              <mat-select formControlName="graduacaoPretendidaId">
                @for (opcao of opcoesGraduacaoPretendida(); track opcao.id) {
                  <mat-option [value]="opcao.id">{{ opcao.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tamanho da faixa</mat-label>
              <mat-select formControlName="tamanhoFaixa">
                @for (tamanho of tamanhos; track tamanho) {
                  <mat-option [value]="tamanho">{{ tamanho }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Peso</mat-label>
              <input matInput type="number" formControlName="peso" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Altura (cm)</mat-label>
              <input matInput type="number" step="1" formControlName="altura" />
            </mat-form-field>

            <mat-form-field class="full" appearance="outline">
              <mat-label>Nome do responsável, se menor de idade</mat-label>
              <input matInput formControlName="nomeResponsavel" />
            </mat-form-field>

            <mat-checkbox class="full" formControlName="aceiteTermo">
              Declaro para os devidos fins, que as informações preenchidas neste formulário são verdadeiras, estou ciente que qualquer informação que não puder ser verificada no dia do exame causará minha reprovação imediata.
            </mat-checkbox>

            @if (erro()) {
              <div class="error full">{{ erro() }}</div>
            }

            <button class="full" mat-flat-button color="primary" type="submit" [disabled]="inscricaoForm.invalid || carregando()">Enviar inscrição</button>
          </form>
        }
      </section>
    </main>
  `,
  styles: [`
    .public-page { min-height: 100vh; padding: 24px; background: var(--app-bg); }
    .public-shell { max-width: 760px; margin: 0 auto; display: grid; gap: 16px; }
    header { display: flex; align-items: center; gap: 12px; }
    header img { width: 48px; height: 48px; object-fit: contain; }
    h1, h2, p { margin: 0; }
    h1 { font-size: 1.2rem; }
    h2 { font-size: 0.95rem; margin-bottom: 8px; }
    .cpf-step { display: grid; gap: 12px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .full { grid-column: 1 / -1; }
    .info-block { border: 1px solid var(--app-border); border-radius: 8px; padding: 12px; background: var(--app-surface-muted); }
    dl { margin: 0; display: grid; gap: 6px; }
    dl div { display: flex; justify-content: space-between; gap: 12px; }
    dt { color: var(--app-muted); }
    dd { margin: 0; font-weight: 760; text-align: right; }
    .error { color: var(--app-danger); font-weight: 760; }
    .success { text-align: center; padding: 32px; border: 1px solid var(--app-border); border-radius: 8px; background: var(--app-surface); }
    .success .material-symbols-outlined { color: var(--app-success); font-size: 42px; }
    @media (max-width: 640px) { .public-page { padding: 14px; } .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class InscricaoPublicaExameComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InscricaoPublicaExameService);
  private readonly graduacoesService = inject(GraduacoesOficiaisService);

  readonly token = this.route.snapshot.paramMap.get('tokenPublico') as string;
  readonly exame = signal<ExameFaixa | null>(null);
  readonly filiado = signal<ValidarCpfInscricaoResponse | null>(null);
  readonly graduacoes = signal<GraduacaoOficial[]>([]);
  readonly opcoesGraduacaoPretendida = computed(() => montarOpcoesGraduacaoPretendida(
    this.graduacoes(),
    this.filiado()?.dataNascimento,
  ));
  readonly carregando = signal(false);
  readonly sucesso = signal(false);
  readonly erro = signal('');
  readonly tamanhos = ['M0', 'M1', 'M2', 'M3', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

  readonly cpfForm = this.fb.nonNullable.group({
    cpf: ['', [Validators.required]],
  });

  readonly inscricaoForm = this.fb.nonNullable.group({
    graduacaoPretendidaId: ['', [Validators.required]],
    tamanhoFaixa: ['A2', [Validators.required]],
    peso: this.fb.control<number | null>(null),
    altura: this.fb.control<number | null>(null),
    nomeResponsavel: [''],
    aceiteTermo: [false, [Validators.requiredTrue]],
  });

  ngOnInit(): void {
    this.service.consultarExame(this.token).subscribe((exame) => this.exame.set(exame));
    this.graduacoesService.listarPublicamente().subscribe((graduacoes) => this.graduacoes.set(graduacoes));
  }

  validarCpf(): void {
    if (this.cpfForm.invalid) return;
    this.erro.set('');
    this.carregando.set(true);
    this.service.validarCpf(this.token, this.cpfForm.getRawValue().cpf).subscribe({
      next: (filiado) => {
        this.filiado.set(filiado);
        this.inscricaoForm.patchValue({ graduacaoPretendidaId: '' });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível validar os dados informados para este exame.');
        this.carregando.set(false);
      },
    });
  }

  inscrever(): void {
    if (this.inscricaoForm.invalid || this.cpfForm.invalid) return;
    this.erro.set('');
    this.carregando.set(true);
    this.service.inscrever(this.token, {
      cpf: this.cpfForm.getRawValue().cpf,
      ...this.inscricaoForm.getRawValue(),
      nomeResponsavel: this.inscricaoForm.getRawValue().nomeResponsavel || null,
    }).subscribe({
      next: () => {
        this.sucesso.set(true);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível concluir a inscrição. Verifique as informações e tente novamente.');
        this.carregando.set(false);
      },
    });
  }
}
