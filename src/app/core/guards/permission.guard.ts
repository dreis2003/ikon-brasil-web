import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permissions = (route.data['permissions'] as string[]) ?? [];
  const roles = (route.data['roles'] as string[]) ?? [];

  if (roles.length > 0 && auth.possuiPerfil(roles)) {
    return true;
  }

  if (permissions.length > 0 && auth.possuiPermissao(permissions)) {
    return true;
  }

  if (roles.length === 0 && permissions.length === 0) {
    return true;
  }

  return router.createUrlTree(['/app/dashboard']);
};
