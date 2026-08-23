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
- `AppShellLayout`が認証状態と必須同意versionを確認し、同意済みのshared diaryと認証必須routeで同じ`MainLayout`を維持します。未同意または確認失敗時はapp内容より先にfull-page gateを表示します。`AuthenticatedLayout`は未認証redirectだけを担当します。
- user settingsの初期化は同意確認後に冪等に実行し、完了するまでapp contentを描画しません。
- loginはcustom Headerとsidebarなしの`MainLayout`です。shared diaryは未認証時に同じpublic shell、認証済みでは`AppShellLayout`の標準HeaderとSidebarを使います。
- `MainLayout`は`mx-auto max-w-4xl px-2`の共通containerを提供します。

## Active features

| Feature       | Current role                                                 |
| ------------- | ------------------------------------------------------------ |
| `home`        | 月選択、Calendar、月単位diary list                           |
| `createDiary` | diary作成、draft、AI、image upload                           |
| `diaries`     | preview、edit、delete、share、image preview                  |
| `searchDiary` | app-wide search Dialogとbrowser内検索                        |
| `sharedDiary` | 公開共有diary、認証済みfavorite・標準shell                   |
| `login`       | Google popup login                                           |
| `legal`       | Markdown管理の公開リーガル文書、初回ログイン後の必須同意gate |
| `sidebar`     | navigation、paged diary list、paged favorite list            |

## Detailed snapshots

- route、認証境界、parameter fallback: `frontend/routing.md`
- リーガルMarkdown、version hash、編集手順: `frontend/legal-documents.md`
- state owner、再取得、browser persistence: `frontend/state.md`
- architectureからの依存違反と不足境界: `frontend/deviations.md`
- 現在のUI token、pattern、参照実装: `frontend/ui.md`
