### Workflow for Each New Feature
- Create a new branch for the feature from `master` (the repository's main branch).
- Switch to this feature branch.
- Make the required changes.
- After making changes, ask the user if that is all. 
  - If **yes**: commit, push, and create a new pull request.
  - If **no**: wait for a new prompt and continue making changes on the current branch.

### Language & Communication Constraint
- **Strictly Language Rule:** Regardless of the language used in the prompt or conversation, all generated content—including code, comments, commit messages, PR descriptions, and branch names—**must be written entirely in English**.

### Infrastructure & Architecture Rules
- If any of the required components do not exist, create them.
- Common functionality and HTTP communication must be located in the `core` layer.
- Follow the Smart/Dumb components strategy.
  - **Smart (Container) components:** Handle data fetching, state management, and inject services.
  - **Dumb (Presentational) components:** Receive data via `@Input()` and emit events via `@Output()`. They must not inject business-logic services.
- All business logic must be placed inside services.

### Clean Architecture & Code Quality
- **No Implicit State in Components:** Avoid subscribing to RxJS streams in the TypeScript file just to assign values to local component variables. Instead, expose streams directly as Observables and use the `async` pipe inside the HTML template.
- **Strict Typing (No `any`):** The use of `any` is strictly prohibited. Define explicit TypeScript interfaces, types, or enums for all API responses, component states, payloads, and configurations.
- **Unidirectional Data Flow:** Strictly use RxJS streams for data propagation. Avoid direct state mutation inside components.
- **Strict Layer Separation:** - Feature modules must not import from other feature modules directly; use shared/core layers or public APIs.
  - Components must never directly access the `HttpClient` or handle raw HTTP responses (always use API/Data services).
- **RxJS Best Practices:** - Always handle subscription cleanups (use `takeUntilDestroyed` or the `async` pipe in templates).
  - Avoid nested `.subscribe()` calls — use mapping operators (`switchMap`, `mergeMap`, `concatMap`) instead.
- **Single Responsibility Principle (SRP):** Keep components small and focused on rendering or orchestration. If a component grows over 200–300 lines, suggest refactoring it into smaller dumb components.

---

## Technical Specifications

### Stack
- **Framework:** Angular 17.3 (standalone components, no `NgModule`).
- **Language:** TypeScript ~5.4.
- **UI:** Angular Material 17.3 (`MatButton`, `MatCard`, `MatExpansionPanel`, `MatProgressBar`) + custom inline styles.
- **Reactivity:** RxJS ~7.8, `zone.js` ~0.14.
- **Auth:** Google Identity Services (GIS) — script `https://accounts.google.com/gsi/client`, OAuth token model (`google.accounts.oauth2.initTokenClient`).
- **Testing:** Karma + Jasmine.
- **Tooling:** Angular CLI 17.3.8.

### Build & run
- `npm start` / `ng serve` → dev server on `http://localhost:4200/`.
- `npm run build` / `ng build` → output to `dist/youtube-stat`.
- `npm test` / `ng test` → Karma/Jasmine unit tests.

### Project layout
- `src/main.ts` — bootstraps `AppComponent` with `appConfig`.
- `src/app/app.config.ts` — providers: `provideRouter`, `provideAnimationsAsync`, `provideHttpClient`.
- `src/app/app.routes.ts` — routes (currently empty).
- `src/app/app.component.ts` — root standalone component; holds the whole auth + data-loading flow.
- `src/app/_models/Channel.ts` — `Channel` and `Video` view models returned by the backend.
- `src/environments/environment.ts` — non-secret config (`scope`, `likedEndpoint`) + pulls `clientId` from `secret.ts`.
- `src/environments/secret.ts` — **gitignored**, holds the real Google `clientId`.
- `src/environments/secret.example.ts` — committed template for `secret.ts`.
- `src/index.html` — loads the GIS client script.

### Configuration & secrets
- The real `clientId` lives only in `src/environments/secret.ts`, which is in `.gitignore`. Developers must copy `secret.example.ts → secret.ts` before building.
- The OAuth `client_secret` / API key is intentionally **not** kept in the frontend (it belongs on the backend).

### Runtime flow
1. User clicks **Sign in** → GIS opens consent and returns an `access_token`.
2. The token is POSTed to the backend: `POST {likedEndpoint}` with body `{ token }` (default `likedEndpoint = https://localhost:7267/api/youtube/liked`).
3. The backend reads the user's liked videos via the YouTube Data API and returns aggregated per-channel statistics (`Channel[]`), which the component renders (avatar, name, percent, expandable video list).

### Backend dependency
- The frontend is non-functional without the backend service: **[NikitaKorzhov/GoogleIntegrationService](https://github.com/NikitaKorzhov/GoogleIntegrationService)**.
- Contract: `POST /api/youtube/liked`, request `{ "token": "<access_token>" }`, response `Channel[]` where each item is `{ channelName, channelId, channelDescription, channelAvatarUrl, percent, videos: [{ name, url }] }`.

## Current State

- **Auth migrated to GIS:** the deprecated `gapi.auth2` / `gapi-script` flow has been fully removed; only GIS token retrieval remains.
- **Statistics computed server-side:** the frontend no longer calls the YouTube Data API directly — it only forwards the token and renders the backend response.
- **Avatars:** rendered with `<img referrerpolicy="no-referrer">` to avoid 403s from `yt3.ggpht.com`.
- **Secrets externalized:** `clientId` moved out of source into the gitignored `secret.ts`.

### Known tech debt (deviates from the rules above)
The current `AppComponent` predates the architecture rules in this file and does not yet follow them. It should be refactored when touched:
- The component **injects `HttpClient` directly** and handles the raw HTTP response — should be moved into a dedicated API/data service in a `core` layer.
- It uses **`any`** for the GIS `google` global and `tokenResponse` — should be replaced with explicit types.
- It **subscribes inside the TS file** and mutates local state + calls `cd.detectChanges()` manually — should expose Observables and use the `async` pipe instead.
- All logic lives in the single root component rather than in services.