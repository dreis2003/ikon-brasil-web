import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Filial, FiliadoRequest, Sexo, TipoSanguineo } from '../../core/models/cadastro.models';
import { CepService } from '../../core/services/cep.service';
import { FiliadosService } from '../../core/services/filiados.service';
import { FiliaisService } from '../../core/services/filiais.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-filiado-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatSelectModule],
  template: `
    <section class="page filiado-page">
      @if (autocadastroEnviado()) {
        <div class="form-card success-card">
          <span class="material-symbols-outlined">check_circle</span>
          <div>
            <h1>Autocadastro enviado</h1>
            <p>Seu cadastro foi recebido e ficara pendente de aprovacao pelo responsavel da filial.</p>
          </div>
        </div>
      } @else {
      <header class="page-header form-header">
        <div>
          <h1 class="page-title">{{ tituloPagina() }}</h1>
          <p class="page-subtitle">{{ subtituloPagina() }}</p>
        </div>
        @if (!publico()) {
          <a mat-button [routerLink]="pendente() ? '/app/filiados-pendentes' : '/app/filiados'">Voltar</a>
        }
      </header>

      <form class="student-form" [formGroup]="form" (ngSubmit)="salvar()">
        <section class="form-card">
          <div class="form-section-title">Filial</div>
          <div class="form-grid two">
            <mat-form-field appearance="outline">
              <mat-label>Filial</mat-label>
              <mat-select formControlName="filialId">
                @for (filial of filiais(); track filial.id) {
                  <mat-option [value]="filial.id">{{ filial.codigo }} - {{ filial.nome }}</mat-option>
                }
              </mat-select>
              @if (!podeEscolherFilial()) {
                <mat-hint>{{ publico() ? 'Filial definida pelo link de autocadastro.' : 'Filial definida pelo usuario logado.' }}</mat-hint>
              }
            </mat-form-field>

            <div class="photo-preview">
              <img [src]="form.controls.fotoPerfilUrl.value || '/assets/logo-ikon.png'" alt="" />
              <div>
                <strong>Foto do filiado</strong>
                <span>Use uma URL publica para exibir a foto no cadastro.</span>
              </div>
            </div>
          </div>
        </section>

        <section class="form-card">
          <div class="form-section-title">Dados pessoais</div>
          <div class="form-grid">
            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Nome completo</mat-label>
              <input matInput formControlName="nomeCompleto" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nome social</mat-label>
              <input matInput formControlName="nomeSocial" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Data de nascimento</mat-label>
              <input matInput type="date" formControlName="dataNascimento" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Sexo</mat-label>
              <mat-select formControlName="sexo">
                <mat-option value="NAO_INFORMADO">Nao informado</mat-option>
                <mat-option value="MASCULINO">Masculino</mat-option>
                <mat-option value="FEMININO">Feminino</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Altura</mat-label>
              <input matInput type="number" formControlName="alturaCm" min="40" max="250" step="1" placeholder="170" />
              <mat-hint>Em centimetros.</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Peso</mat-label>
              <input matInput type="text" formControlName="pesoKg" inputmode="decimal" placeholder="96,3" />
              <mat-hint>Kg com 1 casa decimal.</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>CPF</mat-label>
              <input matInput formControlName="cpf" placeholder="000.000.000-00" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Telefone</mat-label>
              <input matInput formControlName="telefone" placeholder="(11) 90000-0000" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nacionalidade</mat-label>
              <input matInput formControlName="nacionalidade" placeholder="ex: Brasileira" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Naturalidade</mat-label>
              <input matInput formControlName="naturalidade" placeholder="cidade natal" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Profissao</mat-label>
              <input matInput formControlName="profissao" />
            </mat-form-field>
          </div>
        </section>

        <section class="form-card">
          <div class="form-section-title">Karate</div>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Tipo sanguineo</mat-label>
              <mat-select formControlName="tipoSanguineo">
                <mat-option value="">Nao informado</mat-option>
                @for (tipo of tiposSanguineos; track tipo) {
                  <mat-option [value]="tipo">{{ tipo }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Aluno desde</mat-label>
              <input matInput type="date" formControlName="dataInicioTreinamento" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Member Card</mat-label>
              <input matInput formControlName="numeroInternacional" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="span-2">
              <mat-label>URL da foto de perfil</mat-label>
              <input matInput formControlName="fotoPerfilUrl" />
            </mat-form-field>
          </div>
        </section>

        <section class="form-card">
          <div class="form-section-title">Endereco</div>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>CEP</mat-label>
              <input matInput formControlName="cep" maxlength="9" placeholder="00000-000" />
              <mat-hint>Preenche endereco automaticamente.</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline" class="span-2">
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
              <mat-label>UF</mat-label>
              <input matInput formControlName="estado" maxlength="2" />
            </mat-form-field>
          </div>
        </section>

        <section class="form-card">
          <div class="form-section-title">Responsavel <span>para menores de idade</span></div>
          <div class="form-grid">
            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Nome do responsavel</mat-label>
              <input matInput formControlName="responsavelNome" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Parentesco</mat-label>
              <input matInput formControlName="responsavelParentesco" placeholder="pai, mae, tutor..." />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>CPF do responsavel</mat-label>
              <input matInput formControlName="responsavelCpf" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Telefone do responsavel</mat-label>
              <input matInput formControlName="responsavelTelefone" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email do responsavel</mat-label>
              <input matInput type="email" formControlName="responsavelEmail" />
            </mat-form-field>
          </div>
        </section>

        <section class="form-card">
          <div class="form-section-title">Saude</div>
          <mat-form-field appearance="outline" class="wide-field">
            <mat-label>Observacoes medicas</mat-label>
            <textarea matInput formControlName="dadosMedicos" rows="4" placeholder="alergias, restricoes, medicamentos..."></textarea>
          </mat-form-field>
        </section>

        <section class="form-card">
          <div class="form-section-title">Declaracao de saude - PAR-Q</div>
          <p class="help-text">
            Questionario de Prontidao para Atividade Fisica. Responda com sinceridade. Se responder Sim a qualquer item, recomendamos avaliacao medica antes de iniciar ou intensificar a atividade fisica.
          </p>

          <div class="parq-list">
            <div class="parq-item">
              <span>1. Algum medico ja disse que voce possui algum problema de coracao e que so deveria realizar atividade fisica supervisionada por profissionais de saude?</span>
              <mat-radio-group formControlName="parqPergunta1">
                <mat-radio-button [value]="true">Sim</mat-radio-button>
                <mat-radio-button [value]="false">Nao</mat-radio-button>
              </mat-radio-group>
            </div>
            <div class="parq-item">
              <span>2. Voce sente dores no peito quando pratica atividade fisica?</span>
              <mat-radio-group formControlName="parqPergunta2">
                <mat-radio-button [value]="true">Sim</mat-radio-button>
                <mat-radio-button [value]="false">Nao</mat-radio-button>
              </mat-radio-group>
            </div>
            <div class="parq-item">
              <span>3. No ultimo mes, voce sentiu dores no peito ao praticar ou sem praticar atividade fisica?</span>
              <mat-radio-group formControlName="parqPergunta3">
                <mat-radio-button [value]="true">Sim</mat-radio-button>
                <mat-radio-button [value]="false">Nao</mat-radio-button>
              </mat-radio-group>
            </div>
            <div class="parq-item">
              <span>4. Voce apresenta desequilibrio devido a tontura e/ou perda de consciencia?</span>
              <mat-radio-group formControlName="parqPergunta4">
                <mat-radio-button [value]="true">Sim</mat-radio-button>
                <mat-radio-button [value]="false">Nao</mat-radio-button>
              </mat-radio-group>
            </div>
            <div class="parq-item">
              <span>5. Voce possui algum problema osseo ou articular que poderia ser agravado pela atividade fisica?</span>
              <mat-radio-group formControlName="parqPergunta5">
                <mat-radio-button [value]="true">Sim</mat-radio-button>
                <mat-radio-button [value]="false">Nao</mat-radio-button>
              </mat-radio-group>
            </div>
            <div class="parq-item">
              <span>6. Voce toma atualmente algum medicamento para pressao arterial e/ou problema de coracao?</span>
              <mat-radio-group formControlName="parqPergunta6">
                <mat-radio-button [value]="true">Sim</mat-radio-button>
                <mat-radio-button [value]="false">Nao</mat-radio-button>
              </mat-radio-group>
            </div>
            <div class="parq-item">
              <span>7. Sabe de alguma outra razao pela qual voce nao deveria praticar atividade fisica?</span>
              <mat-radio-group formControlName="parqPergunta7">
                <mat-radio-button [value]="true">Sim</mat-radio-button>
                <mat-radio-button [value]="false">Nao</mat-radio-button>
              </mat-radio-group>
            </div>
          </div>

          <div class="declaration">
            Declaro que respondi com sinceridade a todas as perguntas acima. Estou ciente de que, caso tenha respondido SIM a qualquer pergunta, e recomendado consultar um medico antes de iniciar ou intensificar a atividade fisica. Assumo plena responsabilidade por qualquer atividade fisica praticada sem o atendimento a essa recomendacao.
          </div>

          <div class="form-grid two signature-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nome para assinatura</mat-label>
              <input matInput formControlName="assinaturaNome" placeholder="digite o nome completo" />
            </mat-form-field>
            <div class="acceptance">
              <mat-checkbox formControlName="declaracaoSaudeAceite">
                Li e concordo com a declaracao acima e confirmo que as respostas sao verdadeiras. Este aceite registra data, hora e IP como assinatura eletronica. *
              </mat-checkbox>
            </div>
          </div>
        </section>

        <div class="sticky-actions">
          @if (!publico()) {
            <a mat-button [routerLink]="pendente() ? '/app/filiados-pendentes' : '/app/filiados'">Cancelar</a>
          }
          @if (editando() && auth.possuiPermissao(['FILIADO_EDITAR'])) {
            <button mat-stroked-button type="button" (click)="salvarFoto()">Atualizar foto</button>
          }
          @if (pendente() && auth.possuiPermissao(['FILIADO_EDITAR'])) {
            <button mat-stroked-button color="primary" type="button" [disabled]="form.invalid" (click)="aprovar()">
              Aprovar
            </button>
          }
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || (!publico() && editando() && !auth.possuiPermissao(['FILIADO_EDITAR']))">
            {{ publico() ? 'Enviar autocadastro' : 'Salvar cadastro' }}
          </button>
        </div>
      </form>
      }
    </section>
  `,
  styles: [`
    .success-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      margin-top: 32px;
    }

    .success-card .material-symbols-outlined {
      color: var(--app-success);
      font-size: 34px;
    }

    .success-card h1 {
      color: var(--app-text);
      margin: 0 0 6px;
      font-size: 1.45rem;
    }

    .success-card p {
      color: var(--app-muted);
      margin: 0;
      line-height: 1.5;
    }

    .filiado-page {
      max-width: none;
      margin: 0;
    }

    .form-header {
      align-items: flex-start;
      border-bottom: 1px solid var(--app-border);
      padding-bottom: 14px;
      margin-bottom: 14px;
    }

    .student-form {
      display: grid;
      gap: 14px;
    }

    .form-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 8px;
      padding: 18px 20px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .form-section-title {
      color: var(--app-text);
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
      border-bottom: 1px solid var(--app-border);
      padding-bottom: 8px;
      margin-bottom: 14px;
    }

    .form-section-title span {
      color: var(--app-muted);
      font-size: 0.78rem;
      font-weight: 500;
      text-transform: none;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      column-gap: 14px;
      row-gap: 10px;
      align-items: start;
    }

    .form-grid.two {
      grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr);
    }

    .span-2 {
      grid-column: span 2;
    }

    .wide-field {
      width: 100%;
    }

    .photo-preview {
      min-height: 112px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-surface-muted);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
    }

    .photo-preview img {
      width: 92px;
      height: 126px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--app-border);
      background: var(--app-surface);
      flex: 0 0 auto;
    }

    .photo-preview strong,
    .photo-preview span {
      display: block;
    }

    .photo-preview strong {
      color: var(--app-text);
      font-size: 0.86rem;
      font-weight: 700;
    }

    .photo-preview span {
      color: var(--app-muted);
      font-size: 0.74rem;
      line-height: 1.35;
    }

    .help-text {
      color: var(--app-muted);
      font-size: 0.82rem;
      line-height: 1.5;
      margin: 0 0 14px;
    }

    .parq-list {
      display: grid;
      gap: 10px;
    }

    .parq-item {
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-surface-muted);
      padding: 10px;
      display: grid;
      gap: 10px;
    }

    .parq-item span {
      color: var(--app-text);
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1.45;
    }

    .parq-item mat-radio-group {
      display: flex;
      gap: 22px;
      flex-wrap: wrap;
    }

    .declaration {
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-surface-muted);
      color: var(--app-text);
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1.55;
      padding: 11px 12px;
      margin: 14px 0;
    }

    .signature-grid {
      align-items: center;
    }

    .acceptance {
      color: var(--app-text);
      font-weight: 700;
      line-height: 1.45;
    }

    .sticky-actions {
      position: sticky;
      bottom: 0;
      z-index: 2;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      background: color-mix(in srgb, var(--app-bg) 88%, transparent);
      border-top: 1px solid var(--app-border);
      padding: 12px 0 0;
      backdrop-filter: blur(10px);
    }

    @media (max-width: 900px) {
      .form-grid,
      .form-grid.two {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .form-card {
        padding: 14px;
      }

      .form-grid,
      .form-grid.two {
        grid-template-columns: 1fr;
      }

      .span-2 {
        grid-column: span 1;
      }

      .photo-preview {
        align-items: flex-start;
      }

      .photo-preview img {
        width: 82px;
        height: 112px;
      }

      .sticky-actions {
        flex-wrap: wrap;
      }
    }
  `],
})
export class FiliadoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  readonly id = signal<string | null>(null);
  readonly editando = signal(false);
  readonly pendente = signal(false);
  readonly publico = signal(false);
  readonly autocadastroEnviado = signal(false);
  readonly filiais = signal<Filial[]>([]);
  readonly tiposSanguineos: TipoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  readonly form = this.fb.nonNullable.group({
    nomeCompleto: ['', [Validators.required, Validators.maxLength(180)]],
    nomeSocial: [''],
    dataNascimento: ['', [Validators.required]],
    cpf: [''],
    email: ['', [Validators.email]],
    telefone: [''],
    sexo: ['NAO_INFORMADO' as Sexo],
    alturaCm: ['', [Validators.min(40), Validators.max(250), Validators.pattern(/^\d*$/)]],
    pesoKg: ['', [Validators.pattern(/^\d{0,3}([,.]\d)?$/)]],
    tipoSanguineo: ['' as TipoSanguineo | ''],
    dataInicioTreinamento: [''],
    nacionalidade: [''],
    naturalidade: [''],
    profissao: [''],
    numeroInternacional: [''],
    filialId: ['', [Validators.required]],
    fotoPerfilUrl: [''],
    cep: [''],
    logradouro: [''],
    numero: [''],
    complemento: [''],
    bairro: [''],
    cidade: [''],
    estado: [''],
    responsavelNome: [''],
    responsavelParentesco: [''],
    responsavelCpf: [''],
    responsavelTelefone: [''],
    responsavelEmail: ['', [Validators.email]],
    dadosMedicos: [''],
    parqPergunta1: [false],
    parqPergunta2: [false],
    parqPergunta3: [false],
    parqPergunta4: [false],
    parqPergunta5: [false],
    parqPergunta6: [false],
    parqPergunta7: [false],
    assinaturaNome: ['', [Validators.required, Validators.maxLength(180)]],
    declaracaoSaudeAceite: [false, [Validators.requiredTrue]],
  });

  constructor(
    readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cepService: CepService,
    private readonly filiadosService: FiliadosService,
    private readonly filiaisService: FiliaisService,
    private readonly notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.pendente.set(!!this.route.snapshot.data['pendente']);
    this.publico.set(!!this.route.snapshot.data['publico']);
    const id = this.route.snapshot.paramMap.get('id');
    this.id.set(id);
    this.editando.set(!!id);

    if (this.publico()) {
      this.configurarAutocadastroPublico();
      this.configurarBuscaCep();
      return;
    }

    this.carregarFiliais(id);
    if (id) {
      this.filiadosService.buscarPorId(id).subscribe((filiado) => {
        this.form.patchValue({
          nomeCompleto: filiado.nomeCompleto,
          nomeSocial: filiado.nomeSocial ?? '',
          dataNascimento: filiado.dataNascimento,
          cpf: filiado.cpf ?? '',
          email: filiado.email ?? '',
          telefone: filiado.telefone ?? '',
          sexo: filiado.sexo,
          alturaCm: filiado.alturaCm?.toString() ?? '',
          pesoKg: filiado.pesoKg == null ? '' : filiado.pesoKg.toString().replace('.', ','),
          tipoSanguineo: filiado.tipoSanguineo ?? '',
          dataInicioTreinamento: filiado.dataInicioTreinamento ?? '',
          nacionalidade: filiado.nacionalidade ?? '',
          naturalidade: filiado.naturalidade ?? '',
          profissao: filiado.profissao ?? '',
          numeroInternacional: filiado.numeroInternacional ?? '',
          filialId: filiado.filialId,
          fotoPerfilUrl: filiado.fotoPerfilUrl ?? '',
          cep: filiado.endereco?.cep ?? '',
          logradouro: filiado.endereco?.logradouro ?? '',
          numero: filiado.endereco?.numero ?? '',
          complemento: filiado.endereco?.complemento ?? '',
          bairro: filiado.endereco?.bairro ?? '',
          cidade: filiado.endereco?.cidade ?? '',
          estado: filiado.endereco?.estado ?? '',
          responsavelNome: filiado.responsavelNome ?? '',
          responsavelParentesco: filiado.responsavelParentesco ?? '',
          responsavelCpf: filiado.responsavelCpf ?? '',
          responsavelTelefone: filiado.responsavelTelefone ?? '',
          responsavelEmail: filiado.responsavelEmail ?? '',
          dadosMedicos: filiado.dadosMedicos ?? '',
          parqPergunta1: !!filiado.parqPergunta1,
          parqPergunta2: !!filiado.parqPergunta2,
          parqPergunta3: !!filiado.parqPergunta3,
          parqPergunta4: !!filiado.parqPergunta4,
          parqPergunta5: !!filiado.parqPergunta5,
          parqPergunta6: !!filiado.parqPergunta6,
          parqPergunta7: !!filiado.parqPergunta7,
          assinaturaNome: filiado.assinaturaNome ?? '',
          declaracaoSaudeAceite: !!filiado.declaracaoSaudeAceite,
        });
      });
    }
    this.configurarBuscaCep();
  }

  podeEscolherFilial(): boolean {
    return !this.publico() && this.auth.possuiPerfil(['MATRIZ_ADMIN']);
  }

  tituloPagina(): string {
    if (this.publico()) {
      return 'Autocadastro de filiado';
    }
    if (this.pendente()) {
      return 'Filiado pendente';
    }
    return this.editando() ? 'Editar filiado' : 'Novo filiado';
  }

  subtituloPagina(): string {
    if (this.publico()) {
      return 'Preencha seus dados para avaliacao e aprovacao pelo responsavel da filial.';
    }
    if (this.pendente()) {
      return 'Revise os dados enviados no autocadastro e aprove para tornar o filiado oficial.';
    }
    return 'Cadastro completo do membro, dados de treino, endereco, saude e declaracao PAR-Q.';
  }

  salvar(): void {
    if (this.form.invalid) {
      return;
    }
    this.confirmarSalvar();
  }

  private confirmarSalvar(): void {
    const dialogRef = this.dialog.open(ConfirmarSalvarFiliadoDialogComponent, {
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.executarSalvar();
      }
    });
  }

  private executarSalvar(): void {
    const request = this.request();
    const id = this.id();
    const operacao = this.publico()
      ? this.filiadosService.autocadastrar(request.filialId, request)
      : id ? this.filiadosService.atualizar(id, request) : this.filiadosService.criar(request);
    operacao.subscribe(() => {
      if (this.publico()) {
        this.autocadastroEnviado.set(true);
        return;
      }
      this.notification.sucesso(id ? 'Filiado atualizado.' : 'Filiado cadastrado.');
      this.router.navigate([this.pendente() ? '/app/filiados-pendentes' : '/app/filiados']);
    });
  }

  aprovar(): void {
    if (this.form.invalid) {
      return;
    }
    const id = this.id();
    if (!id) {
      return;
    }
    this.filiadosService.atualizar(id, this.request()).subscribe(() => {
      this.filiadosService.aprovar(id).subscribe(() => {
        this.notification.sucesso('Filiado aprovado.');
        this.router.navigate(['/app/filiados']);
      });
    });
  }

  salvarFoto(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    this.filiadosService.atualizarFoto(id, this.form.controls.fotoPerfilUrl.value).subscribe(() => {
      this.notification.sucesso('Foto de perfil atualizada.');
    });
  }

  private request(): FiliadoRequest {
    const valor = this.form.getRawValue();
    return {
      nomeCompleto: valor.nomeCompleto,
      nomeSocial: valor.nomeSocial || null,
      dataNascimento: valor.dataNascimento,
      cpf: valor.cpf || null,
      email: valor.email || null,
      telefone: valor.telefone || null,
      sexo: valor.sexo,
      alturaCm: this.inteiroOuNull(valor.alturaCm),
      pesoKg: this.decimalOuNull(valor.pesoKg),
      tipoSanguineo: valor.tipoSanguineo || null,
      dataInicioTreinamento: valor.dataInicioTreinamento || null,
      nacionalidade: valor.nacionalidade || null,
      naturalidade: valor.naturalidade || null,
      profissao: valor.profissao || null,
      responsavelNome: valor.responsavelNome || null,
      responsavelParentesco: valor.responsavelParentesco || null,
      responsavelCpf: valor.responsavelCpf || null,
      responsavelTelefone: valor.responsavelTelefone || null,
      responsavelEmail: valor.responsavelEmail || null,
      dadosMedicos: valor.dadosMedicos || null,
      parqPergunta1: valor.parqPergunta1,
      parqPergunta2: valor.parqPergunta2,
      parqPergunta3: valor.parqPergunta3,
      parqPergunta4: valor.parqPergunta4,
      parqPergunta5: valor.parqPergunta5,
      parqPergunta6: valor.parqPergunta6,
      parqPergunta7: valor.parqPergunta7,
      assinaturaNome: valor.assinaturaNome || null,
      declaracaoSaudeAceite: valor.declaracaoSaudeAceite,
      numeroInternacional: valor.numeroInternacional || null,
      filialId: valor.filialId,
      fotoPerfilUrl: valor.fotoPerfilUrl || null,
      endereco: {
        logradouro: valor.logradouro || null,
        numero: valor.numero || null,
        complemento: valor.complemento || null,
        bairro: valor.bairro || null,
        cidade: valor.cidade || null,
        estado: valor.estado || null,
        cep: valor.cep || null,
      },
    };
  }

  private inteiroOuNull(valor: string): number | null {
    return valor ? Number.parseInt(valor, 10) : null;
  }

  private decimalOuNull(valor: string): number | null {
    return valor ? Number.parseFloat(valor.replace(',', '.')) : null;
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

  private carregarFiliais(id: string | null): void {
    const usuario = this.auth.usuario();
    if (this.podeEscolherFilial()) {
      this.filiaisService.listar().subscribe((filiais) => {
        this.filiais.set(filiais);
        if (!id && filiais.length === 1) {
          this.form.controls.filialId.setValue(filiais[0].id);
        }
      });
      return;
    }

    if (!usuario?.filialId) {
      this.notification.erro('Usuario logado nao possui filial vinculada.');
      return;
    }

    this.filiaisService.buscarPorId(usuario.filialId).subscribe((filial) => {
      this.filiais.set([filial]);
      this.form.controls.filialId.setValue(filial.id);
      this.form.controls.filialId.disable();
    });
  }

  private configurarAutocadastroPublico(): void {
    const filialId = this.route.snapshot.paramMap.get('filialId');
    if (!filialId) {
      this.notification.erro('Link de autocadastro invalido.');
      return;
    }
    this.filiais.set([{ id: filialId, codigo: 'FILIAL', nome: 'Filial do link', cidade: '', estado: '', status: 'ATIVA', dataCadastro: '' }]);
    this.form.controls.filialId.setValue(filialId);
    this.form.controls.filialId.disable();
  }
}

@Component({
  selector: 'app-confirmar-salvar-filiado-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Confirmar cadastro</h2>
    <mat-dialog-content>
      Deseja salvar os dados deste filiado?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="true">Salvar</button>
    </mat-dialog-actions>
  `,
})
class ConfirmarSalvarFiliadoDialogComponent {
}
