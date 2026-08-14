# Current Emulator and deployment

snapshot metadataは`../firebase.md`を参照してください。

## Local Emulator

| Emulator  | Port |
| --------- | ---: |
| UI        | 4000 |
| Firestore | 8080 |
| Auth      | 9099 |
| Storage   | 9199 |

- `import.meta.env.DEV`時のWeb appは上記Auth / Firestore / Storageへ接続します。
- `docker compose up -d`はNode 22 + Java 21 imageを使い、Firebase CLI versionは未固定です。
- Emulator dataのimport / export永続化はありません。
- `pnpm seed`は3 Emulatorの到達性を確認し、本番へfallbackしません。
- seedはAdmin SDKとStorage Emulator JSON APIを使い、Web clientとRulesを経由しません。
- 対象userのAuth accountと`users/{uid}`を再作成し、Storage `users/{uid}/`は削除します。
- seedするFirestore dataと未作成dataは`../firestore/security-and-seed.md`を参照します。

## Functions and deployment

- `firebase.json`にFunctions設定はありません。
- tracked Functions source、package、build script、callable clientはありません。
- root `functions/`のlocal `node_modules`は現行機能として扱いません。
- Firebase AI LogicはCloud Functionsではありません。
- Hostingは`dist`を配信し、`**`を`/index.html`へrewriteします。
- GitHub Actionsのdeploy scopeはHostingだけで、Firestore / Storage Rulesは対象外です。
- `.firebaserc`はtrackedされず、workflowがproject IDを指定します。
- CIのtriggerとbuild checkは`../tech-stack/testing-and-ci.md`を参照します。
