# Frontendの入口

従来snapshot確認: 2026-08-14、`da479d8`（配下にも適用）。その後の変更は各詳細文書を参照し、現在状態はコードを優先します。

## 起動とProvider

正本は `src/main.tsx` と `src/App.tsx`。

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
