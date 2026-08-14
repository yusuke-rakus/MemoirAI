# Current frontend snapshot

最終確認: 2026-08-14、検証対象のsource snapshot `da479d8`。このmetadataは`frontend/`配下にも適用します。

現在のrouter、Provider、state、frontend依存関係の入口です。目標構造は`../architecture/frontend.md`を参照してください。

## Bootstrap and providers

```text
React.StrictMode
└─ RouterProvider (createBrowserRouter, path="*")
   └─ TooltipProvider
      └─ UserProvider (LocalUserContext)
         └─ App → NotificationToaster + Routes
```

- `src/main.tsx`がroot routerと最上位Providerを構成します。
- `src/App.tsx`が実際のRoutesとfeature entryを宣言します。
- 認証必須routeは`AuthenticatedLayout → MainLayout → Outlet`です。
- loginとshared diaryは`MainLayout`を使いますが、custom Headerとsidebarなしです。
- `MainLayout`は`mx-auto max-w-4xl px-2`の共通containerを提供します。

## Active features

| Feature       | Current role                                |
| ------------- | ------------------------------------------- |
| `home`        | 月選択、Calendar、月単位diary list          |
| `createDiary` | diary作成、draft、AI、image upload          |
| `diaries`     | preview、edit、delete、share、image preview |
| `searchDiary` | app-wide search Dialogとbrowser内検索       |
| `sharedDiary` | 未認証で閲覧する共有diary                   |
| `login`       | Google popup login                          |
| `sidebar`     | navigationとpaged diary list                |

## Detailed snapshots

- route、認証境界、parameter fallback: `frontend/routing.md`
- state owner、再取得、browser persistence: `frontend/state.md`
- architectureからの依存違反と不足境界: `frontend/deviations.md`
- 現在のUI token、pattern、参照実装: `frontend/ui.md`
