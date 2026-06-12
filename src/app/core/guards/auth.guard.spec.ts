import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { GoogleAuthService } from '../services/google-auth.service';

describe('authGuard', () => {
  function runGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    ) as boolean | UrlTree;
  }

  function configure(isAuthenticated: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: GoogleAuthService, useValue: { isAuthenticated: () => isAuthenticated } },
      ],
    });
  }

  it('should allow activation when the user is authenticated', () => {
    configure(true);
    expect(runGuard()).toBeTrue();
  });

  it('should redirect to /login when the user is not authenticated', () => {
    configure(false);
    const result = runGuard();
    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
