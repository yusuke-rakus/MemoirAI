# Frontendの入口

初回調査の基準は2026-08-14の `da479d8` です。各詳細文書は変更があった箇所を個別に更新しています。現在の実装は関連するコードで確認してください。

## 起動とProvider

Providerとrouteの構成は [main.tsx](../../src/main.tsx) と [App.tsx](../../src/App.tsx) を参照してください。

```text
StrictMode → RouterProvider → QueryClientProvider → TooltipProvider
→ UserProvider（UserAppearance + QueryCacheSessionBoundary）→ App（Toaster + Routes）
```

## 必要な詳細だけを読む

| 対象                                        | 参照先                                         |
| ------------------------------------------- | ---------------------------------------------- |
| route・shell・認証 / 同意境界・遅延読み込み | [routing](frontend/routing.md)                 |
| state・Query cache・下書き・ゲスト引き継ぎ  | [state](frontend/state.md)                     |
| theme・layout・Dialog・検索・ショートカット | [UI](frontend/ui.md)                           |
| リーガルMarkdown・編集・version管理         | [legal documents](frontend/legal-documents.md) |
| 目標architectureからの逸脱                  | [deviations](frontend/deviations.md)           |

配置・主要featureは [repository map](repository-map.md)、目標構造は [frontend architecture](../architecture/frontend.md) を参照。
