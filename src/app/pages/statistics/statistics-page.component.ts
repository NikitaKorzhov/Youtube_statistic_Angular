import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Channel } from '../../_models/Channel';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { YoutubeStatsService } from '../../core/services/youtube-stats.service';
import { ChannelCardComponent } from './channel-card/channel-card.component';

/** View state for the statistics page, consumed through the async pipe. */
interface StatisticsViewModel {
  loading: boolean;
  channels: Channel[];
  error: string | null;
}

/**
 * Statistics page: loads the liked-channel statistics for the current token and
 * shows a waiting screen while the request is in flight. Reached only with a valid
 * token (see authGuard); a refresh clears the in-memory token and sends the user
 * back to /login.
 */
@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, ChannelCardComponent],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent implements OnInit {
  vm$!: Observable<StatisticsViewModel>;

  constructor(
    private authService: GoogleAuthService,
    private statsService: YoutubeStatsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.token;
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.vm$ = this.statsService.getLikedChannels(token).pipe(
      map((channels): StatisticsViewModel => ({ loading: false, channels, error: null })),
      catchError((error: Error) =>
        of<StatisticsViewModel>({ loading: false, channels: [], error: error.message })
      ),
      startWith<StatisticsViewModel>({ loading: true, channels: [], error: null })
    );
  }
}
