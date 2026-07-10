import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../services/theme.service';
import { PerfilUsuarioPipe } from '../../shared/pipes/perfil-usuario.pipe';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
  roles?: string[];
}

interface MenuGroup {
  label: string;
  icon: string;
  items: MenuItem[];
  initiallyExpanded?: boolean;
}

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    PerfilUsuarioPipe,
  ],
  template: `
    <section class="shell">
      <mat-toolbar class="topbar">
        <button class="btn shell-icon-button menu-toggle" type="button" (click)="alternarMenuLateral()" matTooltip="Exibir ou ocultar menu">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="topbar-brand">
          <img src="/assets/logo-ikon.png" alt="IKO Nakamura Brasil" />
          <div>
            <strong>Plataforma IKO Nakamura Brasil</strong>
            <span>Gestão Nacional</span>
          </div>
        </div>
        <span class="spacer"></span>

        <div class="topbar-actions">
          <button class="btn shell-icon-button action-button" type="button" (click)="theme.alternar()" matTooltip="Alternar tema">
            <span class="material-symbols-outlined">{{ theme.dark() ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <div class="user-card">
            <span class="user-avatar">{{ iniciaisUsuario() }}</span>
            <div class="user-info">
              <strong>{{ auth.usuario()?.nome }}</strong>
              <span>{{ auth.usuario()?.perfil | perfilUsuario }}</span>
            </div>
          </div>

          <button class="btn shell-icon-button action-button logout-button" type="button" (click)="auth.logout()" matTooltip="Sair">
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </mat-toolbar>

      <mat-sidenav-container class="shell-body">
        <mat-sidenav class="sidebar" [mode]="mobile() ? 'over' : 'side'" [opened]="menuLateralAberto()">
        <nav class="nav">
          <a class="nav-direct" [routerLink]="dashboard.route" routerLinkActive="active" (click)="fecharMenuMobile()">
            <span class="material-symbols-outlined">{{ dashboard.icon }}</span>
            <span>{{ dashboard.label }}</span>
          </a>

          <mat-accordion class="nav-accordion" multi>
            @for (group of gruposVisiveis(); track group.label) {
              <mat-expansion-panel class="nav-group" [expanded]="group.initiallyExpanded">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <span class="material-symbols-outlined">{{ group.icon }}</span>
                    <span>{{ group.label }}</span>
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="nav-group-items">
                  @for (item of group.items; track item.route + item.label) {
                    <a [routerLink]="item.route" routerLinkActive="active" (click)="fecharMenuMobile()">
                      <span class="material-symbols-outlined">{{ item.icon }}</span>
                      <span>{{ item.label }}</span>
                    </a>
                  }
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>
        </nav>
      </mat-sidenav>

      <mat-sidenav-content>
        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
    </section>
  `,
  styleUrl: './shell-layout.component.scss',
})
export class ShellLayoutComponent {
  readonly mobile = signal(window.innerWidth < 920);
  readonly menuLateralAberto = signal(window.innerWidth >= 920);
  readonly iniciaisUsuario = computed(() => {
    const nome = this.auth.usuario()?.nome?.trim();
    if (!nome) {
      return 'IK';
    }
    return nome
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  readonly dashboard: MenuItem = { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' };

  readonly grupos: MenuGroup[] = [
    {
      label: 'Cadastros',
      icon: 'assignment_ind',
      initiallyExpanded: true,
      items: [
        { label: 'Filiados', icon: 'groups', route: '/app/filiados', permissions: ['FILIADO_VISUALIZAR'] },
        { label: 'Filiais', icon: 'account_balance', route: '/app/filiais', permissions: ['FILIAL_VISUALIZAR_TODAS'], roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
        { label: 'Usuários', icon: 'manage_accounts', route: '/app/honbu/usuarios', roles: ['MATRIZ_ADMIN'] },
        { label: 'Examinadores', icon: 'workspace_premium', route: '/app/graduacoes', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'] },
      ],
    },
    {
      label: 'Graduações',
      icon: 'military_tech',
      initiallyExpanded: true,
      items: [
        { label: 'Dashboard', icon: 'space_dashboard', route: '/app/graduacoes', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'] },
        { label: 'Exames de Faixa', icon: 'grading', route: '/app/graduacoes/exames', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_RESPONSAVEL'] },
        { label: 'Programações', icon: 'event_note', route: '/app/graduacoes/programacoes', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'] },
        { label: 'Histórico de Graduações', icon: 'history_edu', route: '/app/graduacoes/historico', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'] },
        { label: 'Certificados Pendentes', icon: 'fact_check', route: '/app/graduacoes/certificados-pendentes', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
        { label: 'Tabela Oficial de Graduacoes', icon: 'format_list_numbered', route: '/app/graduacoes/tabela-oficial', roles: ['MATRIZ_ADMIN'] },
        { label: 'Pré-requisitos', icon: 'rule', route: '/app/graduacoes/pre-requisitos', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
        { label: 'Valores Oficiais', icon: 'payments', route: '/app/graduacoes/valores-oficiais', roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
      ],
    },
    {
      label: 'Campeonatos',
      icon: 'emoji_events',
      items: [
        { label: 'Campeonatos', icon: 'emoji_events', route: '/app/dashboard' },
        { label: 'Categorias', icon: 'category', route: '/app/dashboard' },
        { label: 'Inscricoes', icon: 'app_registration', route: '/app/dashboard' },
        { label: 'Resultados', icon: 'leaderboard', route: '/app/dashboard' },
      ],
    },
    {
      label: 'Relatórios',
      icon: 'monitoring',
      items: [
        { label: 'Relatórios', icon: 'query_stats', route: '/app/relatorios/filial', permissions: ['RELATORIO_VISUALIZAR_FILIAL', 'RELATORIO_VISUALIZAR_TODOS'] },
      ],
    },
    {
      label: 'Configurações',
      icon: 'settings',
      items: [
        { label: 'Usuários', icon: 'admin_panel_settings', route: '/app/honbu/usuarios', roles: ['MATRIZ_ADMIN'] },
      ],
    },
  ];

  readonly gruposVisiveis = computed(() => this.grupos
    .map((group) => ({ ...group, items: group.items.filter((item) => this.podeVer(item)) }))
    .filter((group) => group.items.length > 0));

  constructor(
    readonly auth: AuthService,
    readonly theme: ThemeService,
  ) {
    window.addEventListener('resize', () => this.mobile.set(window.innerWidth < 920));
  }

  alternarMenuLateral(): void {
    this.menuLateralAberto.set(!this.menuLateralAberto());
  }

  fecharMenuMobile(): void {
    if (this.mobile()) {
      this.menuLateralAberto.set(false);
    }
  }

  private podeVer(item: MenuItem): boolean {
    const possuiRestricaoPorPerfil = !!item.roles?.length;
    const possuiRestricaoPorPermissao = !!item.permissions?.length;

    if (item.roles && this.auth.possuiPerfil(item.roles)) {
      return true;
    }
    if (item.permissions) {
      return this.auth.possuiPermissao(item.permissions);
    }
    return !possuiRestricaoPorPerfil && !possuiRestricaoPorPermissao;
  }
}
