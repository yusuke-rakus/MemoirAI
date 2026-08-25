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
- Firebase AI LogicとreCAPTCHA EnterpriseのattestationはEmulator対象ではありません。developmentではApp Check debug token modeを使い、実AI確認はBlazeの開発projectへ到達します。
- 初回development起動時にbrowser consoleへ表示されるApp Check debug tokenをFirebase ConsoleのWeb appへ登録します。debug tokenは`.env`、GitHub Actions、sourceへ保存しません。
- `docker compose up -d`はNode 22 + Java 21 imageを使い、Firebase CLI versionは未固定です。
- Emulator dataのimport / export永続化はありません。
- `pnpm seed`は3 Emulatorの到達性を確認し、本番へfallbackしません。
- seedはAdmin SDKとStorage Emulator JSON APIを使い、Web clientとRulesを経由しません。
- 対象userのAuth accountと`users/{uid}`を再作成し、Storage `users/{uid}/`は削除します。
- seedするFirestore dataと未作成dataは`../firestore/security-and-seed.md`を参照します。
- `pnpm test:rules`は起動済みFirestore / Storage Emulatorへ接続し、account削除用Rulesを検証します。

## Functions and deployment

- `firebase.json`にFunctions設定はありません。
- tracked Functions source、package、build script、callable clientはありません。
- root `functions/`のlocal `node_modules`は現行機能として扱いません。
- Firebase AI LogicはCloud Functionsではありません。
- Hostingは`dist`を配信し、`**`を`/index.html`へrewriteします。
- GitHub Actionsのdeploy scopeはHostingだけで、Firestore / Storage Rulesは対象外です。
- GitHub Actionsのbuildには`VITE_DIARY_IMAGE_MODEL`、`VITE_DIARY_IMAGE_SIZE`、`VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`をrepository secretsから渡します。model / sizeを未設定にするとapp既定値を使いますが、Enterprise site keyは必須です。
- `.firebaserc`はtrackedされず、workflowがproject IDを指定します。
- CIのtriggerとbuild checkは`../tech-stack/testing-and-ci.md`を参照します。

## Account deletion configuration deployment

account削除機能はCloud Functionsを使用しません。repository変更だけではRulesとTTLは本番へ反映されないため、対象projectを明示して別途deployします。

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage --project <project-id>
```

`firestore:indexes`には`legalAcceptances.retentionExpiresAt`のTTL policyが含まれます。現在のHosting workflowはこのdeployを実行しません。

## Console setup for diary illustration

repository変更だけでは実AI生成を有効化できません。対象projectごとに次を設定します。

1. Firebase projectをBlaze planにし、Firebase AI Logic APIを有効化する。
2. reCAPTCHA EnterpriseでWeb keyを作成し、Firebase Hosting domainと利用するcustom domainを許可する。
3. Firebase App Checkで対象Web appへreCAPTCHA Enterprise providerとsite keyを登録する。
4. developmentで表示されたdebug tokenをApp Checkのdebug token一覧へ登録する。
5. Firebase AI LogicのApp CheckをBaseline protectionでenforceする。
6. GitHub Actionsへ3つのbuild環境変数を登録し、Hostingを再deployする。

Replay protectionとauthenticated-users modeは今回有効化しません。実AI確認は課金が発生し得るため、登録済みdebug tokenを使うBlaze開発projectで明示的に実施します。
