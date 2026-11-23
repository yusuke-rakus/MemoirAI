# MemoirAI

React / TypeScript / ViteとFirebaseで構成する日記アプリです。開発にはpnpmを使用します。

## セットアップ

`.env.example` をGit管理外の `.env` へコピーし、開発用の値を設定します。Emulator・App Checkの条件は [開発環境の詳細](docs/project/firebase/emulator-and-deployment.md) を参照してください。

```bash
pnpm install
docker compose up -d
pnpm seed
pnpm dev
```

フロントは http://localhost:13000、Firebase Emulator UIは http://localhost:14000 で開きます。

`pnpm seed` は起動済みAuth / Firestore / Storage Emulator専用です。投入内容は `scripts/seedData.json` で編集します。シードユーザーはGoogleログインのpopupから選択できます。

- UID: `memoir-ai-development-user`
- メール: `developer@memoir-ai.local`

再seedでは対象ユーザーのAuthアカウントとFirestoreの `users/{uid}` 以下を削除し、seedデータを作り直します。Storageの `users/{uid}/` 以下は削除のみです。詳細は [Emulatorのseed手順](docs/project/firebase/emulator-and-deployment.md#seed) を参照してください。

## 検証・ビルド

テストの選び方と実行コマンドは [検証ルール](docs/rules/testing.md) を参照してください。本番用buildは `pnpm build`。

エージェント向け入口は [AGENTS.md](AGENTS.md)、文書索引は [docs/index.md](docs/index.md)。
