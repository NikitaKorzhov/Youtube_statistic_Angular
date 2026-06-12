import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  /** Sends the GIS access token to the backend and returns per-channel statistics. */
  getLikedChannels(token: string): Observable<Channel[]> {
    const body: LikedChannelsRequest = { token };
    return this.http.post<Channel[]>(this.likedEndpoint, body);
  }
}
