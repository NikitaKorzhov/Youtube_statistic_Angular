import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Channel } from './_models/Channel';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

declare const google: any;

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

  private client_id = environment.clientId;
  private scope = environment.scope;
  private likedEndpoint = environment.likedEndpoint;
  private tokenClient: any;
  private token: string | null = null;

  constructor(private cd: ChangeDetectorRef, private ngZone: NgZone, private http: HttpClient) {}

  ngOnInit(): void {
    this.initTokenClient();
  }

  // Потрібно для перемальовки при розгортанні/згортанні списку відео
  public change(): void {
    this.cd.detectChanges();
  }

  // 1. Ініціалізація GIS token client (бібліотека accounts.google.com/gsi/client)
  private initTokenClient(): void {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      // Скрипт GIS ще не завантажився — пробуємо трохи пізніше
      setTimeout(() => this.initTokenClient(), 200);
      return;
    }
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.client_id,
      scope: this.scope,
      callback: (tokenResponse: any) => {
        this.ngZone.run(() => {
          if (tokenResponse && tokenResponse.access_token) {
            this.token = tokenResponse.access_token;
            this.isSignedInFlag = true;
            console.log('Access token received via GIS');
            this.loadChannels();
          } else {
            console.error('No access token received', tokenResponse);
          }
          this.cd.detectChanges();
        });
      }
    });
    console.log('GIS token client initialized');
  }

  // Кнопка авторизації: GIS відкриває згоду і повертає access_token у callback вище
  public signIn(): void {
    if (!this.tokenClient) {
      console.error('GIS token client not initialized yet');
      this.initTokenClient();
      return;
    }
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  // 2. Запит статистики каналів на API-сервер за отриманим токеном
  private loadChannels(): void {
    if (!this.token) {
      console.error('No access token available to send');
      return;
    }
    this.isLoading = true;
    this.cd.detectChanges();
    this.http.post<Array<Channel>>(this.likedEndpoint, { token: this.token }).subscribe({
      next: (response) => {
        this.chanels = response ?? [];
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error loading channels', error);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }
}
