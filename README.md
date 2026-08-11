# React + TypeScript + Vite

このテンプレートは、Vite で React を動作させるための最小限のセットアップを提供します（HMR といくつかの ESLint ルールを含みます）。

現在、2つの公式プラグインが利用可能です：

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) [Babel](https://babeljs.io/) を使用した Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) [SWC](https://swc.rs/) を使用した Fast Refresh

## プロジェクトのセットアップ

このプロジェクトではパッケージ管理に `pnpm` を使用しています。

```bash
# 依存関係のインストール
pnpm install

# Firebase Emulator の起動
docker compose up -d

# 開発用ユーザーと日記データの投入
pnpm seed

# 開発サーバーの起動
pnpm dev

# 本番用ビルド
pnpm build
```

`pnpm seed` は起動済みの Auth、Firestore、Storage Emulator にのみ接続します。
Emulator が起動していない場合はデータを投入せず終了します。
投入内容は `scripts/seedData.json` で編集できます。

シードユーザーは Google アカウントとして Auth Emulator に登録されるため、
既存のログインボタンで開くポップアップから選択できます。

- UID: `memoir-ai-development-user`
- メールアドレス: `developer@memoir-ai.local`

ユーザーを追加する場合は、`scripts/seedData.json` の `users` 配列へ
UID とメールアドレスが重複しない要素を追加します。

シードを再実行すると、`users` 配列に定義された各ユーザーの Auth データ、
Firestore の `users/{uid}` 以下、Storage の `users/{uid}/` 以下を削除してから
初期データを作り直します。それ以外のユーザーのデータは削除しません。

## ESLint 設定の拡張

本番アプリケーションを開発している場合は、型認識（type-aware）Lint ルールを有効にするように設定を更新することを推奨します：

```js
export default tseslint.config({
  extends: [
    // ...tseslint.configs.recommended を削除し、以下に置き換えます
    ...tseslint.configs.recommendedTypeChecked,
    // または、より厳格なルールを使用する場合
    ...tseslint.configs.strictTypeChecked,
    // オプションで、スタイルに関するルールを追加する場合
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // その他のオプション...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

また、React 固有の Lint ルールとして [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) と [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) をインストールすることもできます：

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // react-x と react-dom プラグインを追加
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // その他のルール...
    // 推奨される TypeScript ルールを有効化
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
