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

`pnpm seed` は起動済みAuth / Firestore / Storage Emulator専用です。投入内容は `scripts/seedData.json` で編集します。シードユーザーはGoogleログインのpopupから選択できます。

- UID: `memoir-ai-development-user`
- メール: `developer@memoir-ai.local`

ユーザー追加時は `users` 配列でUID・メールの重複を避けます。再seedでは定義したユーザーのAuthデータ、Firestore `users/{uid}` 以下、Storage `users/{uid}/` 以下を削除・再作成します。他ユーザーは削除しません。

## 検証・ビルド

変更したテストは `pnpm exec vitest run <対象.test.ts>` で実行します。全体検証を定型実行せず、[検証ルール](docs/rules/testing.md)から必要な確認を選びます。本番用buildは `pnpm build`。

エージェント向け入口は [AGENTS.md](AGENTS.md)、文書索引は [docs/index.md](docs/index.md)。
