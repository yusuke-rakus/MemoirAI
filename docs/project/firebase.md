# Firebaseの入口

初回調査は2026-08-20の `5f27069` と当時のworking treeを基準としています。現在の設定や挙動は関連するコード・設定で確認してください。

## 初期化

- [env.ts](../../src/lib/env.ts) が `VITE_*` を読み、[firebase.ts](../../src/firebase/firebase.ts) がApp → App Check → Auth / Firestore / Storageを初期化する。環境変数名は [.env.example](../../.env.example)、実値はGit管理外の `.env`。
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
