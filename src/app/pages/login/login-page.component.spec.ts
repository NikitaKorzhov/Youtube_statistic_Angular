import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { GoogleAuthService } from '../../core/services/google-auth.service';

class MockAuthService {
  accessToken$ = new Subject<string>();
  authError$ = new Subject<string>();
  initialize = jasmine.createSpy('initialize');
  requestAccessToken = jasmine.createSpy('requestAccessToken');
}

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let component: LoginPageComponent;
  let auth: MockAuthService;
  let router: { navigate: jasmine.Spy };

  beforeEach(async () => {
    auth = new MockAuthService();
    router = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: GoogleAuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize GIS', () => {
    expect(component).toBeTruthy();
    expect(auth.initialize).toHaveBeenCalled();
  });

  it('should request an access token when the button is clicked', () => {
    component.signIn();
    expect(auth.requestAccessToken).toHaveBeenCalled();
  });

  it('should navigate to /statistics once a token is received', () => {
    auth.accessToken$.next('ya29.token');
    expect(router.navigate).toHaveBeenCalledWith(['/statistics']);
  });

  it('should show the auth error message', () => {
    auth.authError$.next('Authorization failed: access_denied');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('access_denied');
  });
});
