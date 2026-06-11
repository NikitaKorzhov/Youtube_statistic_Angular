import { secret } from './secret';

export const environment = {
  production: false,
  // Приватний параметр береться з secret.ts (gitignored)
  clientId: secret.clientId,
  scope: 'https://www.googleapis.com/auth/youtube.readonly',
  likedEndpoint: 'https://localhost:7267/api/youtube/liked',
};
