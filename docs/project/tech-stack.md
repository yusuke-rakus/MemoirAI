# Current tech stack

最終確認: 2026-08-20、検証対象のsource snapshot `5f27069`。このmetadataは`tech-stack/`配下にも適用します。

versionは変動情報です。`package.json`、lockfile、各設定を現在状態の一次情報とします。

## Runtime and application

| Area            | Current implementation                                         |
| --------------- | -------------------------------------------------------------- |
| UI runtime      | React / React DOM 19.1                                         |
| Language        | TypeScript 6.0、`strict: true`                                 |
| Build / routing | Vite 8、`@vitejs/plugin-react`、React Router DOM 7             |
| Styling         | Tailwind CSS 4、global CSS variables                           |
| UI primitives   | shadcn `new-york`、Radix、CVA、Lucide                          |
| State / forms   | React、Context、Zustand 5、react-hook-form 7、zod 3、resolvers |
| Backend         | Firebase Web SDK 12: Auth、Firestore、Storage、AI              |

## Notable libraries

| Library                   | Current use                          |
| ------------------------- | ------------------------------------ |
| FullCalendar              | home月Calendar                       |
| Radix Collapsible         | sidebarのfavorite section開閉        |
| react-day-picker          | Dialog内の日付選択                   |
| Embla Carousel            | diary画像carousel                    |
| date-fns / uuid           | 日付処理 / ID生成                    |
| Sonner                    | toast                                |
| Motion                    | text / login motion、reduced-motion  |
| Three.js + postprocessing | Login背景                            |
| next-themes               | Sonnerが`next-themes/useTheme`を参照 |
| firebase-admin + tsx      | Emulator-only seed                   |

app themeは独自`useTheme`がdocument classを操作し、rootにnext-themesの`ThemeProvider`はありません。CSSにはOKLCH、旧HSL、dark tokenが併存し、単一形式は確立していません。

`tailwind.config.js`には`hsl(var(...))` mappingが残っています。

FullCalendarの`--fc-border-color`はappの`--border`へ接続済みですが、同CSSに`hsl(var(...))`と`var(...)`が併存します。

## Details

- package manager、設定、scripts: `tech-stack/tooling.md`
- test基盤、CI、README差異: `tech-stack/testing-and-ci.md`
