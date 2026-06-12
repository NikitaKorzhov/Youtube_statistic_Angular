import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { StatisticsPageComponent } from './statistics-page.component';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { YoutubeStatsService } from '../../core/services/youtube-stats.service';
import { Channel } from '../../_models/Channel';

describe('StatisticsPageComponent', () => {
  let fixture: ComponentFixture<StatisticsPageComponent>;
  let auth: { token: string | null };
  let stats: { getLikedChannels: jasmine.Spy };
  let router: { navigate: jasmine.Spy };

  const channel: Channel = {
    channelName: 'Prince Ea',
    channelId: 'UC123',
    channelDescription: 'desc',
    channelAvatarUrl: 'https://example.com/avatar.jpg',
    percent: 42,
    videos: [{ name: 'My Video', url: 'https://youtube.com/watch?v=1' }],
  };

  function setup(): void {
    TestBed.configureTestingModule({
      imports: [StatisticsPageComponent],
      providers: [
        provideNoopAnimations(),
        { provide: GoogleAuthService, useValue: auth },
        { provide: YoutubeStatsService, useValue: stats },
        { provide: Router, useValue: router },
      ],
    });
    fixture = TestBed.createComponent(StatisticsPageComponent);
  }

  beforeEach(() => {
    auth = { token: 'tok' };
    stats = { getLikedChannels: jasmine.createSpy('getLikedChannels').and.returnValue(of([channel])) };
    router = { navigate: jasmine.createSpy('navigate') };
  });

  it('should redirect to /login when there is no token', () => {
    auth.token = null;
    setup();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(stats.getLikedChannels).not.toHaveBeenCalled();
  });

  it('should request statistics with the token and render a card per channel', () => {
    setup();
    fixture.detectChanges();
    expect(stats.getLikedChannels).toHaveBeenCalledWith('tok');
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('app-channel-card');
    expect(cards.length).toBe(1);
  });

  it('should show an error message when loading fails', () => {
    stats.getLikedChannels.and.returnValue(throwError(() => new Error('backend is down')));
    setup();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('backend is down');
  });
});
