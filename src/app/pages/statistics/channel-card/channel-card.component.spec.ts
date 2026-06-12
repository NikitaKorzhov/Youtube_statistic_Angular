import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ChannelCardComponent } from './channel-card.component';
import { Channel } from '../../../_models/Channel';

describe('ChannelCardComponent', () => {
  let fixture: ComponentFixture<ChannelCardComponent>;
  let component: ChannelCardComponent;

  const channel: Channel = {
    channelName: 'Prince Ea',
    channelId: 'UC123',
    channelDescription: 'A spoken word artist',
    channelAvatarUrl: 'https://example.com/avatar.jpg',
    percent: 42,
    videos: [{ name: 'My Video', url: 'https://youtube.com/watch?v=1' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelCardComponent);
    component = fixture.componentInstance;
    component.channel = channel;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the channel name and percent', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Prince Ea');
    expect(text).toContain('42');
  });

  it('should render the avatar with a no-referrer policy', () => {
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(img?.getAttribute('src')).toBe(channel.channelAvatarUrl);
  });
});
