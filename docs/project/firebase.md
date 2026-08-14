# Current Firebase configuration

最終確認: 2026-08-14、検証対象のsource snapshot `da479d8`。このmetadataは`firebase/`配下にも適用します。

Firestore schema、query、Rulesは`firestore.md`を参照してください。

## Initialization

- `src/lib/env.ts`が`VITE_*`環境変数を読みます。
- `src/firebase/firebase.ts`がApp、Auth、Firestore、Storageを一度だけ初期化します。
- keyは`VITE_API_KEY`、`VITE_AUTH_DOMAIN`、`VITE_PROJECT_ID`、`VITE_STORAGE_BUCKET`、`VITE_MESSAGING_SENDER_ID`、`VITE_APP_ID`、`VITE_MEASUREMENT_ID`です。
- Analyticsは未初期化で、`measurementId`はconfigへ渡すだけです。
- App Check、Realtime Database、Messagingの利用は確認できません。

## Active services

| Service           | Current use                           | Main source               |
| ----------------- | ------------------------------------- | ------------------------- |
| Authentication    | Google login、auth state、logout      | auth hooks、`AppSidebar`  |
| Cloud Firestore   | diary、settings、memory、shared copy  | `src/lib/service/*Client` |
| Cloud Storage     | diary images                          | `DiaryImageClient`        |
| Firebase AI Logic | title / tag生成、long-term memory抽出 | `src/firebase/models`     |
| Hosting           | `dist` SPA配信                        | config、GitHub Actions    |

## Detailed snapshots

- Authentication: `firebase/auth.md`
- Cloud Storage: `firebase/storage.md`
- Firebase AIと複数resource操作: `firebase/ai-and-operations.md`
- Emulator、Functions、Hosting deploy: `firebase/emulator-and-deployment.md`
