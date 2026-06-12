import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GoogleAuthService } from '../../core/services/google-auth.service';

/**
 * Login page: shows the Google sign-in button and, once a token is obtained,
 * redirects to the statistics page.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit, OnDestroy {
  /** Authorization error message, rendered via the async pipe. */
  readonly authError$ = this.authService.authError$;

  private readonly $destroy = new Subject<void>();

  constructor(
    private authService: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.initialize();
    this.authService.accessToken$
      .pipe(takeUntil(this.$destroy))
      .subscribe(() => this.router.navigate(['/statistics']));
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  signIn(): void {
    this.authService.requestAccessToken();
  }
}
