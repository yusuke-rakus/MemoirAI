# Repository responsibility map

最終確認: 2026-08-20、検証対象のsource snapshot `5f27069` + working tree。

新規コードの配置先を判断するための現在の責務マップです。

## Root and operations

| Location                            | Responsibility                          |
| ----------------------------------- | --------------------------------------- |
| `package.json`、`pnpm-lock.yaml`    | dependencyとscripts                     |
| Vite / TypeScript config            | bundler、alias、app / node build        |
| ESLint / Prettier config            | repository-wide lint / format           |
| `firebase.json`、`firebase/*.rules` | Hosting、Emulator、Security Rules       |
| `compose.yaml`、`docker/`           | local Emulator runtime                  |
| `scripts/`                          | local運用scriptとseed                   |
| `.github/workflows/`                | CI/CD                                   |
| `docs/`                             | rules、architecture、snapshot、workflow |

## Application source

| Location                     | Current responsibility                                  |
| ---------------------------- | ------------------------------------------------------- |
| `src/main.tsx` / `App`       | root Provider、router、route entry                      |
| `src/features/<feature>`     | feature固有page、component、hook、state、type、constant |
| `src/components/ui`          | shadcn / Radix primitive                                |
| `src/components/shared`      | app shellまたは複数featureで使うapp固有UI               |
| `src/layout`                 | auth境界、Header、Sidebar、main shell                   |
| `src/hooks` / `src/contexts` | app横断hook / React Context                             |
| `src/stores`                 | cross-feature Zustand store                             |
| `src/lib/service`            | Firestore、Storage、browser persistence client          |
| `src/firebase`               | Firebase初期化とAI model                                |
| `src/lib`                    | 横断utility、env、ID、表示計算                          |
| `src/types`                  | featureを跨ぐ共有型・永続化型                           |
| `src/constants`              | path、theme、画像制約、共有固定値                       |
| `src/index.css`              | global CSS、theme variable、Tailwind mapping            |

active featureはhome、createDiary、diaries、searchDiary、sharedDiary、login、sidebarです。sidebarは自分の日記とfavorite共有日記のpaged listを持ちます。`src/features/editDiary`に追跡sourceはなく、編集UIはdiaries配下にあります。

createDiaryは通常保存と絵日記保存を持ちます。保存modeはfeature-local state、画像model設定は`src/firebase/models`、生成responseから`File`への変換は`src/lib/service/diaryIllustrationClient.ts`、永続化は既存`DiaryImageClient`の責務です。

## Placement procedure

1. 既存featureの責務と現在のconsumer範囲を確認する。
2. feature固有ならfeature内、app横断UIならshared、pure primitiveならuiへ置く。
3. 外部data accessは用途別gatewayへ置き、UIからSDKを直接呼ばない。
4. app横断stateはconsumerを確認してstoresまたはcontextsを選ぶ。
5. 新しいtop-level directoryは既存分類で責務を表現できない場合だけ追加する。

gateway、browser draft、依存違反の詳細は`frontend.md`、Firebase / Firestoreの親文書を参照してください。
