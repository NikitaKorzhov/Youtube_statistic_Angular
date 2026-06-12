import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { GoogleAuthService } from '../services/google-auth.service';

/**
 * Protects the statistics page: the access token lives only in memory, so a page
 * refresh (or any direct navigation without signing in) sends the user to /login.
 */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(GoogleAuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
