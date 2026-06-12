import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Subset of the GIS token response we rely on. */
interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

/** Token client returned by `google.accounts.oauth2.initTokenClient`. */
interface GoogleTokenClient {
  requestAccessToken(overrideConfig?: { prompt?: string }): void;
}

/** Minimal typing for the Google Identity Services global. */
declare const google: {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
      }): GoogleTokenClient;
    };
  };
};

/**
 * Core service that owns all Google Identity Services (GIS) authentication.
 * Components must use this service instead of touching the `google` global directly.
 */
@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  /** Maximum number of times we poll for the GIS script before giving up (~5s at 200ms). */
  private static readonly MAX_INIT_ATTEMPTS = 25;
  private static readonly INIT_RETRY_MS = 200;

  private readonly clientId = environment.clientId;
  private readonly scope = environment.scope;
  private tokenClient: GoogleTokenClient | null = null;
  private initAttempts = 0;

  private readonly accessTokenSubject = new Subject<string>();
  private readonly authErrorSubject = new Subject<string>();

  /** Emits an access token each time the user successfully authorizes. */
  readonly accessToken$: Observable<string> = this.accessTokenSubject.asObservable();
  /** Emits a human-readable message whenever authorization fails. */
  readonly authError$: Observable<string> = this.authErrorSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  /** Prepares the GIS token client; retries until the GIS script has loaded. */
  initialize(): void {
    if (this.tokenClient) {
      return;
    }
    if (!this.isGisAvailable()) {
      if (++this.initAttempts >= GoogleAuthService.MAX_INIT_ATTEMPTS) {
        this.fail('Google Identity Services failed to load. Check your network and try again.');
        return;
      }
      setTimeout(() => this.initialize(), GoogleAuthService.INIT_RETRY_MS);
      return;
    }
    this.initAttempts = 0;
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: this.scope,
      callback: (response: GoogleTokenResponse) =>
        this.ngZone.run(() => this.handleTokenResponse(response)),
    });
  }

  /** Opens the Google consent screen to request an access token. */
  requestAccessToken(): void {
    if (!this.tokenClient) {
      this.initialize();
      // The GIS script may still be loading — retry shortly if init succeeded.
      if (!this.tokenClient) {
        setTimeout(() => this.requestAccessToken(), GoogleAuthService.INIT_RETRY_MS);
        return;
      }
    }
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  /** Routes a GIS callback to the success or error stream. */
  private handleTokenResponse(response: GoogleTokenResponse): void {
    if (response && response.access_token) {
      this.accessTokenSubject.next(response.access_token);
      return;
    }
    this.fail(
      response && response.error
        ? `Authorization failed: ${response.error}`
        : 'Authorization failed: no access token was returned.'
    );
  }

  /** Logs and emits an authorization error. */
  private fail(message: string): void {
    console.error(message);
    this.authErrorSubject.next(message);
  }

  private isGisAvailable(): boolean {
    return typeof google !== 'undefined' && !!google.accounts && !!google.accounts.oauth2;
  }
}
