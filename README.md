# YoutubeStat

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.8.

## Налаштування перед запуском

### 1. Google OAuth ключ (обовʼязково)

Реальний `clientId` не зберігається в репозиторії (файл з ним у `.gitignore`). Перед першим запуском його треба додати вручну:

1. Скопіюйте шаблон секретів:
   ```bash
   cp src/environments/secret.example.ts src/environments/secret.ts
   ```
2. Відкрийте `src/environments/secret.ts` і впишіть свій Google OAuth **Client ID**:
   ```ts
   export const secret = {
     clientId: 'ВАШ_CLIENT_ID.apps.googleusercontent.com',
   };
   ```

Client ID створюється в [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Client ID, тип *Web application*). У **Authorized JavaScript origins** додайте `http://localhost:4200`.

Без створеного `secret.ts` проєкт не збереться.

### 2. Бекенд (обовʼязково)

Для роботи системи потрібен **бекенд-сервер**, який приймає access_token і повертає статистику каналів (ендпоінт `POST /api/youtube/liked`, за замовчуванням `https://localhost:7267`). 

> ⚠️ Бекенд наразі **ще не опублікований** — він буде викладений найближчим часом. Без запущеного бекенда авторизація працюватиме, але список каналів не завантажиться.

Адреса ендпоінта налаштовується в `src/environments/environment.ts` (поле `likedEndpoint`).

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
