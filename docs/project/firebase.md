# Firebaseの入口

従来snapshot確認: 2026-08-20、`5f27069` + working tree（配下にも適用）。現在状態はコード・設定を優先します。

## 初期化

- `src/lib/env.ts` が `VITE_*` を読み、`src/firebase/firebase.ts` がApp → App Check → Auth / Firestore / Storageを初期化する。環境変数名はtracked template `.env.example`、実値はGit管理外の `.env`。
- Analyticsは未初期化（measurementIdを渡すだけ）。Realtime Database / Messagingの利用は確認できない。

## 必要な詳細だけを読む

| 対象                                                 | 参照先                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| Google認証・復元・logout・profile                    | [Auth](firebase/auth.md)                                       |
| 日記画像・path・制約・cleanup                        | [Storage](firebase/storage.md)                                 |
| AI model / size・App Check・複数resource操作・ゲスト | [AI and operations](firebase/ai-and-operations.md)             |
| Emulator・seed・Functions・Hosting deploy            | [Emulator and deployment](firebase/emulator-and-deployment.md) |
| Firestore schema・query・公開範囲・Rules             | [Firestore map](firestore.md)                                  |

固定方針は [Firebase rules](../rules/firebase.md)、目標境界は [data access](../architecture/data-access.md)。
