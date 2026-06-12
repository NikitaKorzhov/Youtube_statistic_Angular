import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { YoutubeStatsService } from './youtube-stats.service';
import { Channel } from '../../_models/Channel';
import { environment } from '../../../environments/environment';

describe('YoutubeStatsService', () => {
  let service: YoutubeStatsService;
  let httpMock: HttpTestingController;

  const mockChannels: Channel[] = [
    {
      channelName: 'Prince Ea',
      channelId: 'UC123',
      channelDescription: 'desc',
      channelAvatarUrl: 'https://example.com/avatar.jpg',
      percent: 0.53,
      videos: [{ name: 'Video 1', url: 'https://youtube.com/watch?v=1' }],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [YoutubeStatsService],
    });
    service = TestBed.inject(YoutubeStatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST the token to the liked endpoint and return channels', () => {
    let result: Channel[] | undefined;
    service.getLikedChannels('valid-token').subscribe((channels) => (result = channels));

    const req = httpMock.expectOne(environment.likedEndpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'valid-token' });

    req.flush(mockChannels);
    expect(result).toEqual(mockChannels);
  });

  it('should fail fast without calling HTTP when the token is empty', () => {
    let error: Error | undefined;
    service.getLikedChannels('   ').subscribe({
      next: () => fail('should not emit a value'),
      error: (e: Error) => (error = e),
    });

    httpMock.expectNone(environment.likedEndpoint);
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain('Access token is required');
  });

  it('should map a backend error response to a friendly message', () => {
    let error: Error | undefined;
    service.getLikedChannels('valid-token').subscribe({
      next: () => fail('should not emit a value'),
      error: (e: Error) => (error = e),
    });

    const req = httpMock.expectOne(environment.likedEndpoint);
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(error?.message).toContain('status 500');
  });

  it('should map a connection failure (status 0) to a reachability message', () => {
    let error: Error | undefined;
    service.getLikedChannels('valid-token').subscribe({
      next: () => fail('should not emit a value'),
      error: (e: Error) => (error = e),
    });

    const req = httpMock.expectOne(environment.likedEndpoint);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(error?.message).toContain('Cannot reach the statistics backend');
  });
});
