import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Channel } from '../../_models/Channel';
import { environment } from '../../../environments/environment';

/** Payload sent to the backend to request liked-channel statistics. */
export interface LikedChannelsRequest {
  token: string;
}

/**
 * Core service responsible for all HTTP communication with the statistics backend.
 * Components must use this service instead of touching HttpClient directly.
 */
@Injectable({ providedIn: 'root' })
export class YoutubeStatsService {
  private readonly likedEndpoint = environment.likedEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * Sends the GIS access token to the backend and returns per-channel statistics.
   * Fails fast on an empty token and maps backend/transport failures to a clear error.
   */
  getLikedChannels(token: string): Observable<Channel[]> {
    if (!token || !token.trim()) {
      return throwError(() => new Error('Access token is required to load channels'));
    }

    const body: LikedChannelsRequest = { token };
    return this.http.post<Channel[]>(this.likedEndpoint, body).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to load liked channels', error);
        return throwError(() => new Error(this.describeError(error)));
      })
    );
  }

  /** Builds a human-readable message from an HTTP error. */
  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Cannot reach the statistics backend. Make sure it is running.';
    }
    return `The statistics backend returned an error (status ${error.status}).`;
  }
}
