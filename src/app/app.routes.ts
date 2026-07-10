import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './core/layout/shell-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'autocadastro/:filialId',
    data: { publico: true },
    loadComponent: () => import('./features/filiados/filiado-form.component').then((m) => m.FiliadoFormComponent),
  },
  {
    path: 'exames/inscricao-publica/:tokenPublico',
    data: { publico: true },
    loadComponent: () => import('./features/graduacoes/exames/pages/inscricao-publica/inscricao-publica-exame.component').then((m) => m.InscricaoPublicaExameComponent),
  },
  {
    path: 'app',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'filiados',
        canActivate: [permissionGuard],
        data: { permissions: ['FILIADO_VISUALIZAR'] },
        loadComponent: () => import('./features/filiados/filiados-list.component').then((m) => m.FiliadosListComponent),
      },
      {
        path: 'filiados/novo',
        canActivate: [permissionGuard],
        data: { permissions: ['FILIADO_CRIAR'] },
        loadComponent: () => import('./features/filiados/filiado-form.component').then((m) => m.FiliadoFormComponent),
      },
      {
        path: 'filiados-pendentes',
        canActivate: [permissionGuard],
        data: { permissions: ['FILIADO_VISUALIZAR'] },
        loadComponent: () => import('./features/filiados/filiados-pendentes-list.component').then((m) => m.FiliadosPendentesListComponent),
      },
      {
        path: 'filiados-pendentes/:id',
        canActivate: [permissionGuard],
        data: { permissions: ['FILIADO_VISUALIZAR'], pendente: true },
        loadComponent: () => import('./features/filiados/filiado-form.component').then((m) => m.FiliadoFormComponent),
      },
      {
        path: 'filiados/:id',
        canActivate: [permissionGuard],
        data: { permissions: ['FILIADO_VISUALIZAR'] },
        loadComponent: () => import('./features/filiados/filiado-form.component').then((m) => m.FiliadoFormComponent),
      },
      {
        path: 'filiais',
        loadComponent: () => import('./features/filiais/filiais-list.component').then((m) => m.FiliaisListComponent),
      },
      {
        path: 'filiais/nova',
        canActivate: [permissionGuard],
        data: { permissions: ['FILIAL_CRIAR'] },
        loadComponent: () => import('./features/filiais/filial-form.component').then((m) => m.FilialFormComponent),
      },
      {
        path: 'filiais/:id',
        canActivate: [permissionGuard],
        data: { permissions: ['FILIAL_EDITAR'] },
        loadComponent: () => import('./features/filiais/filial-form.component').then((m) => m.FilialFormComponent),
      },
      {
        path: 'relatorios/filial',
        canActivate: [permissionGuard],
        data: { permissions: ['RELATORIO_VISUALIZAR_FILIAL', 'RELATORIO_VISUALIZAR_TODOS'] },
        loadComponent: () => import('./features/relatorios/relatorio-filial.component').then((m) => m.RelatorioFilialComponent),
      },
      {
        path: 'graduacoes',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'] },
        loadComponent: () => import('./features/graduacoes/pages/dashboard/graduacoes-dashboard.component').then((m) => m.GraduacoesDashboardComponent),
      },
      {
        path: 'graduacoes/exames',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_RESPONSAVEL'] },
        loadComponent: () => import('./features/graduacoes/exames/pages/exames-list/exames-faixa-list.component').then((m) => m.ExamesFaixaListComponent),
      },
      {
        path: 'graduacoes/exames/novo',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_RESPONSAVEL'] },
        loadComponent: () => import('./features/graduacoes/exames/pages/exame-form/exame-faixa-form.component').then((m) => m.ExameFaixaFormComponent),
      },
      {
        path: 'graduacoes/exames/:id/editar',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_RESPONSAVEL'] },
        loadComponent: () => import('./features/graduacoes/exames/pages/exame-form/exame-faixa-form.component').then((m) => m.ExameFaixaFormComponent),
      },
      {
        path: 'graduacoes/exames/:id',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_RESPONSAVEL'] },
        loadComponent: () => import('./features/graduacoes/exames/pages/exame-detail/exame-faixa-detail.component').then((m) => m.ExameFaixaDetailComponent),
      },
      {
        path: 'graduacoes/programacoes',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'] },
        loadComponent: () => import('./features/graduacoes/pages/dashboard/graduacoes-dashboard.component').then((m) => m.GraduacoesDashboardComponent),
      },
      {
        path: 'graduacoes/historico',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR', 'FILIAL_PROFESSOR', 'FILIAL_RESPONSAVEL'] },
        loadComponent: () => import('./features/graduacoes/pages/dashboard/graduacoes-dashboard.component').then((m) => m.GraduacoesDashboardComponent),
      },
      {
        path: 'graduacoes/certificados-pendentes',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
        loadComponent: () => import('./features/graduacoes/pages/dashboard/graduacoes-dashboard.component').then((m) => m.GraduacoesDashboardComponent),
      },
      {
        path: 'graduacoes/tabela-oficial',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN'] },
        loadComponent: () => import('./features/graduacoes/pages/tabela-oficial/tabela-oficial-graduacoes.component').then((m) => m.TabelaOficialGraduacoesComponent),
      },
      {
        path: 'graduacoes/pre-requisitos',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
        loadComponent: () => import('./features/graduacoes/pages/dashboard/graduacoes-dashboard.component').then((m) => m.GraduacoesDashboardComponent),
      },
      {
        path: 'graduacoes/valores-oficiais',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN', 'MATRIZ_OPERADOR'] },
        loadComponent: () => import('./features/graduacoes/pages/dashboard/graduacoes-dashboard.component').then((m) => m.GraduacoesDashboardComponent),
      },
      {
        path: 'honbu/usuarios',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN'] },
        loadComponent: () => import('./features/honbu/usuarios-list.component').then((m) => m.UsuariosListComponent),
      },
      {
        path: 'honbu/usuarios/novo',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN'] },
        loadComponent: () => import('./features/honbu/usuario-form.component').then((m) => m.UsuarioFormComponent),
      },
      {
        path: 'honbu/usuarios/:id',
        canActivate: [permissionGuard],
        data: { roles: ['MATRIZ_ADMIN'] },
        loadComponent: () => import('./features/honbu/usuario-form.component').then((m) => m.UsuarioFormComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
