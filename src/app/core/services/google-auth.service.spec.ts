import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GoogleAuthService } from './google-auth.service';

interface CapturedConfig {
  client_id: string;
  scope: string;
  callback: (response: { access_token?: string; error?: string }) => void;
}

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let requestSpy: jasmine.Spy;
  let capturedConfig: CapturedConfig | null;

  function installGisMock(): void {
    requestSpy = jasmine.createSpy('requestAccessToken');
    capturedConfig = null;
    (window as unknown as { google: unknown }).google = {
      accounts: {
        oauth2: {
          initTokenClient: (config: CapturedConfig) => {
            capturedConfig = config;
            return { requestAccessToken: requestSpy };
          },
        },
      },
    };
  }

  function removeGisMock(): void {
    delete (window as unknown as { google?: unknown }).google;
  }

  beforeEach(() => {
    installGisMock();
    TestBed.configureTestingModule({ providers: [GoogleAuthService] });
    service = TestBed.inject(GoogleAuthService);
  });

  afterEach(() => removeGisMock());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should configure the GIS token client with client id and scope', () => {
    service.initialize();
    expect(capturedConfig).toBeTruthy();
    expect(capturedConfig!.client_id).toBeTruthy();
    expect(capturedConfig!.scope).toContain('youtube');
  });

  it('should emit the access token on a successful callback', (done) => {
    service.initialize();
    service.accessToken$.subscribe((token) => {
      expect(token).toBe('ya29.token');
      done();
    });
    capturedConfig!.callback({ access_token: 'ya29.token' });
  });

  it('should expose the token and report authentication after a successful callback', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token).toBeNull();

    service.initialize();
    capturedConfig!.callback({ access_token: 'ya29.token' });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.token).toBe('ya29.token');
  });

  it('should stay unauthenticated when the callback returns no token', () => {
    service.initialize();
    capturedConfig!.callback({ error: 'access_denied' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token).toBeNull();
  });

  it('should emit an auth error when the callback returns an error', (done) => {
    service.initialize();
    service.authError$.subscribe((message) => {
      expect(message).toContain('access_denied');
      done();
    });
    capturedConfig!.callback({ error: 'access_denied' });
  });

  it('should emit an auth error when the callback returns no token', (done) => {
    service.initialize();
    service.authError$.subscribe((message) => {
      expect(message).toContain('no access token');
      done();
    });
    capturedConfig!.callback({});
  });

  it('should open the consent screen on requestAccessToken', () => {
    service.initialize();
    service.requestAccessToken();
    expect(requestSpy).toHaveBeenCalledWith({ prompt: 'consent' });
  });

  it('should emit an auth error if GIS never loads', fakeAsync(() => {
    removeGisMock(); // GIS script is unavailable

    let error: string | undefined;
    service.authError$.subscribe((message) => (error = message));

    service.initialize();
    tick(25 * 200); // exhaust all retry attempts

    expect(error).toContain('failed to load');
  }));
});
