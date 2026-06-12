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
  private readonly clientId = environment.clientId;
  private readonly scope = environment.scope;
  private tokenClient: GoogleTokenClient | null = null;
  private readonly accessTokenSubject = new Subject<string>();

  /** Emits an access token each time the user successfully authorizes. */
  readonly accessToken$: Observable<string> = this.accessTokenSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  /** Prepares the GIS token client; retries until the GIS script has loaded. */
  initialize(): void {
    if (this.tokenClient) {
      return;
    }
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      setTimeout(() => this.initialize(), 200);
      return;
    }
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: this.scope,
      callback: (response: GoogleTokenResponse) =>
        this.ngZone.run(() => {
          if (response && response.access_token) {
            this.accessTokenSubject.next(response.access_token);
          } else {
            console.error('No access token received', response);
          }
        }),
    });
  }

  /** Opens the Google consent screen to request an access token. */
  requestAccessToken(): void {
    if (!this.tokenClient) {
      this.initialize();
      // The GIS script may still be loading — retry shortly.
      setTimeout(() => this.requestAccessToken(), 200);
      return;
    }
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }
}
