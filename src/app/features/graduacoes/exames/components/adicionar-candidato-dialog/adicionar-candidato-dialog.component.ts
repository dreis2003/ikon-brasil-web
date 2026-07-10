import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GraduacaoOficial } from '../../../models/graduacao-oficial.models';
import { montarOpcoesGraduacaoPretendida } from '../../../models/opcao-graduacao-pretendida.models';
import { GraduacoesOficiaisService } from '../../../services/graduacoes-oficiais.service';
import { AdicionarCandidatoRequest } from '../../models/exames-faixa.models';

@Component({
  selector: 'app-adicionar-candidato-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Adicionar filiado ao exame</h2>
    <mat-dialog-content>
      <form class="dialog-form" [formGroup]="form">
        <mat-form-field class="full" appearance="outline">
          <mat-label>Filiado</mat-label>
          <input matInput formControlName="filiadoId" placeholder="ID do filiado, nome, CPF ou número internacional" />
        </mat-form-field>
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
          <mat-label>Responsável, se menor de idade</mat-label>
          <input matInput formControlName="nomeResponsavel" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="salvar()">Adicionar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding-top: 4px; }
    .full { grid-column: 1 / -1; }
    @media (max-width: 640px) { .dialog-form { grid-template-columns: 1fr; } }
  `],
})
export class AdicionarCandidatoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdicionarCandidatoDialogComponent>);
  private readonly graduacoesService = inject(GraduacoesOficiaisService);
  readonly tamanhos = ['M0', 'M1', 'M2', 'M3', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
  readonly graduacoes = signal<GraduacaoOficial[]>([]);
  readonly opcoesGraduacaoPretendida = computed(() => montarOpcoesGraduacaoPretendida(this.graduacoes()));
  readonly form = this.fb.nonNullable.group({
    filiadoId: ['', [Validators.required]],
    graduacaoPretendidaId: ['', [Validators.required]],
    tamanhoFaixa: ['A2', [Validators.required]],
    peso: this.fb.control<number | null>(null),
    altura: this.fb.control<number | null>(null),
    nomeResponsavel: [''],
  });

  ngOnInit(): void {
    this.graduacoesService.listar().subscribe((graduacoes) => this.graduacoes.set(graduacoes));
  }

  salvar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.dialogRef.close({
      filiadoId: v.filiadoId,
      graduacaoPretendidaId: v.graduacaoPretendidaId,
      tamanhoFaixa: v.tamanhoFaixa,
      peso: v.peso,
      altura: v.altura,
      nomeResponsavel: v.nomeResponsavel || null,
    } satisfies AdicionarCandidatoRequest);
  }
}
