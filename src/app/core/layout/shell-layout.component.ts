import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
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
          @for (item of menuVisivel(); track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" (click)="fecharMenuMobile()">
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
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

  readonly menu: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },
    { label: 'Filiados', icon: 'groups', route: '/app/filiados', permissions: ['FILIADO_VISUALIZAR'] },
    { label: 'Filiados Pendentes', icon: 'pending_actions', route: '/app/filiados-pendentes', permissions: ['FILIADO_VISUALIZAR'] },
    { label: 'Filiais', icon: 'account_balance', route: '/app/filiais', permissions: ['FILIAL_VISUALIZAR_TODAS'], roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
    { label: 'Relatorios', icon: 'monitoring', route: '/app/relatorios/filial', permissions: ['RELATORIO_VISUALIZAR_FILIAL', 'RELATORIO_VISUALIZAR_TODOS'] },
    { label: 'HONBU', icon: 'admin_panel_settings', route: '/app/honbu/usuarios', roles: ['MATRIZ_ADMIN'] },
  ];

  readonly menuVisivel = computed(() => this.menu.filter((item) => this.podeVer(item)));

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
