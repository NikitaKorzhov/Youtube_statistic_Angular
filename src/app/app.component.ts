import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { Channel } from './_models/Channel';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import { GoogleAuthService } from './core/services/google-auth.service';
import { YoutubeStatsService } from './core/services/youtube-stats.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,MatButtonModule,MatExpansionModule,MatProgressBarModule,MatCardModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isSignedInFlag: boolean = false;
  public chanels: Array<Channel> = [];
  public isLoading: boolean = false;

  constructor(
    private authService: GoogleAuthService,
    private statsService: YoutubeStatsService,
    private destroyRef: DestroyRef
  ) {
    // When the user authorizes, fetch their liked-channel statistics.
    this.authService.accessToken$
      .pipe(takeUntilDestroyed())
      .subscribe((token: string) => {
        this.isSignedInFlag = true;
        this.loadChannels(token);
      });
  }

  ngOnInit(): void {
    this.authService.initialize();
  }

  // Кнопка авторизації: відкриває згоду Google і повертає access_token через сервіс
  public signIn(): void {
    this.authService.requestAccessToken();
  }

  // Запит статистики каналів на API-сервер за отриманим токеном
  private loadChannels(token: string): void {
    this.isLoading = true;
    this.statsService.getLikedChannels(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: Channel[]) => {
          this.chanels = response ?? [];
          this.isLoading = false;
        },
        error: (error: unknown) => {
          console.error('Error loading channels', error);
          this.isLoading = false;
        }
      });
  }
}
