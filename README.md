# YoutubeStat

Angular application that signs the user in with Google (via Google Identity Services), sends the obtained access token to a backend service, and displays statistics about the channels behind the user's liked YouTube videos.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.8.

## How it works

1. The user clicks **Sign in** — Google Identity Services (GIS) returns an OAuth `access_token`.
2. The token is sent to the backend (`POST /api/youtube/liked`).
3. The backend fetches the liked videos from the YouTube Data API and returns aggregated per-channel statistics, which the app renders.

## Setup before running

### 1. Google OAuth client ID (required)

The real `clientId` is **not** stored in the repository (its file is in `.gitignore`). You must add it manually before the first run:

1. Copy the secrets template:
   ```bash
   cp src/environments/secret.example.ts src/environments/secret.ts
   ```
2. Open `src/environments/secret.ts` and put in your Google OAuth **Client ID**:
   ```ts
   export const secret = {
     clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
   };
   ```

Create the Client ID in the [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Client ID, type *Web application*). Add `http://localhost:4200` to **Authorized JavaScript origins**.

Without `secret.ts` the project will not build.

### 2. Backend (required)

The app needs a **backend service** that accepts the access token and returns channel statistics (endpoint `POST /api/youtube/liked`, `https://localhost:7267` by default).

➡️ **Backend repository:** [NikitaKorzhov/GoogleIntegrationService](https://github.com/NikitaKorzhov/GoogleIntegrationService)

Clone and run it following the instructions in that repository. The endpoint URL is configured in `src/environments/environment.ts` (the `likedEndpoint` field). Without a running backend, sign-in still works but the channel list will not load.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
