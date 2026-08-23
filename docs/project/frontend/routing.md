# Current routing

実装上の正本は`src/App.tsx`、base path metadataは`src/constants/path.ts`です。snapshot metadataは`../frontend.md`を参照してください。

## Router structure

`src/main.tsx`の`createBrowserRouter`は単一の`path: "*"`へ`App`を置き、実際の分岐を`App`内の`<Routes>`で行います。

### Authenticated routes

`AppShellLayout`がauth確認と必須同意versionの確認、認証済みroute間で維持される標準`MainLayout`を担当します。同意記録がない場合はapp contentを描画せずfull-page gateを表示します。その内側の`AuthenticatedLayout`が未認証ユーザーを`/login`へredirectします。

| Path                        | Result / fallback                       |
| --------------------------- | --------------------------------------- |
| `/`、`/calendar`            | 当月の`/calendar/:year/:month`へreplace |
| `/calendar/:year/:month`    | `HomePage`のCalendar tab                |
| `/diaries`                  | 当月の`/diaries/:year/:month`へreplace  |
| `/diaries/:year/:month`     | `HomePage`の日記一覧tab                 |
| `/diaries/:dateParamString` | `DiariesPage`。parse失敗時は現在日      |
| `/new-diary`                | 当日の`/new-diary/:date`へreplace       |
| `/new-diary/:date`          | `NewDiaryPage`。parse失敗時は現在日     |

当月・当日のredirectは`initialDateStore`の現在日を使います。日付routeは通常`yyyy-MM-dd`で、`new Date()`によりparseします。

年月parserは整数yearと1〜12のmonthなら月初を返します。それ以外でもmonth文字列を`new Date(month)`で解釈できれば採用し、`Invalid Date`の場合だけ現在日に戻るため、strict validationではありません。

`HomePage`はpathnameでCalendar / Diary tabを選び、tab変更時に年月付きURLへnavigateします。

### Public routes

| Path               | Result                | Notes                                                                               |
| ------------------ | --------------------- | ----------------------------------------------------------------------------------- |
| `/login`           | `LoginPage`           | `LoginHeader`、sidebarなし                                                          |
| `/shared/:diaryId` | `SharedDiaryPage`     | 公開共有copy。未認証はpage側のpublic shell、認証時は永続する標準shellとfavorite操作 |
| `/legal`           | `LegalPage`           | Markdown管理の3文書を1ページで公開。認証・同意状態に関係なく閲覧可能                |
| `/terms`           | `LegacyLegalRedirect` | `/legal#terms`へreplace                                                             |
| `/privacy`         | `LegacyLegalRedirect` | `/legal#privacy`へreplace                                                           |
| `/ai-data-use`     | `LegacyLegalRedirect` | `/legal#ai-data-use`へreplace                                                       |

認証済みの`/shared/:diaryId`も必須同意gateの対象です。未認証での公開共有閲覧とlegal routeはgate対象外です。`/legal`の戻るlinkだけは軽量なAuth listenerで認証状態を判定し、認証済みでは`/`、未認証では`/login`へ戻します。

### Navigation sources

- path・表示名・icon: `src/constants/path.ts`
- sidebar: `src/features/sidebar/components/SidebarNavigation.tsx`
- home tab: `src/features/home/constants/views.tsx`
- detail return state: `src/features/diaries/types.ts`

catch-all 404、route-level `errorElement`、loader / action、lazy loading、共通URL schemaはありません。未知pathは専用404 UIを表示しません。
