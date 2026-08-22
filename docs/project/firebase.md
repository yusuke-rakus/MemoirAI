# Current Firebase configuration

最終確認: 2026-08-20、検証対象のsource snapshot `5f27069` + working tree。 このmetadataは`firebase/`配下にも適用します。

Firestore schema、query、Rulesは`firestore.md`を参照してください。

## Initialization

- `.env.example`をtracked templateとし、localではGit管理外の`.env`へ実値を設定します。`src/lib/env.ts`が`VITE_*`環境変数を読みます。
- `src/firebase/firebase.ts`がAppを初期化し、App Checkを有効化してからAuth、Firestore、Storageを取得します。
- Firebase configのkeyは`VITE_API_KEY`、`VITE_AUTH_DOMAIN`、`VITE_PROJECT_ID`、`VITE_STORAGE_BUCKET`、`VITE_MESSAGING_SENDER_ID`、`VITE_APP_ID`、`VITE_MEASUREMENT_ID`です。
- 絵日記生成は`VITE_DIARY_IMAGE_MODEL`と`VITE_DIARY_IMAGE_SIZE`を読みます。未設定時は`gemini-3.1-flash-lite-image` / `1K`です。不明な値またはモデル非対応の組み合わせは起動時の設定エラーになります。
- App Checkは`VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`を必須とし、reCAPTCHA Enterprise providerと自動token更新を使用します。developmentではdebug token mode、testではApp Check初期化skipです。
- Analyticsは未初期化で、`measurementId`はconfigへ渡すだけです。
- Realtime Database、Messagingの利用は確認できません。

## Active services

| Service           | Current use                                      | Main source                |
| ----------------- | ------------------------------------------------ | -------------------------- |
| Authentication    | Google login、auth state、logout                 | auth hooks、`AppSidebar`   |
| App Check         | reCAPTCHA Enterprise / development debug token   | `src/firebase/appCheck.ts` |
| Cloud Firestore   | diary、settings、memory、shared copy             | `src/lib/service/*Client`  |
| Cloud Storage     | manual / AI-generated diary images               | `DiaryImageClient`         |
| Firebase AI Logic | title / tag、long-term memory、watercolor images | `src/firebase/models`      |
| Hosting           | `dist` SPA配信                                   | config、GitHub Actions     |

## Detailed snapshots

- Authentication: `firebase/auth.md`
- Cloud Storage: `firebase/storage.md`
- Firebase AIと複数resource操作: `firebase/ai-and-operations.md`
- Emulator、Functions、Hosting deploy: `firebase/emulator-and-deployment.md`
