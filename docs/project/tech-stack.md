# 技術構成の入口

従来snapshot確認: 2026-08-20、`5f27069`（配下にも適用）。現在のversion・scripts・設定は `package.json`、`pnpm-lock.yaml`、各設定が正本です。

React / TypeScript / Vite / React Router、Tailwind / shadcn / Radix、Zustand / Context / TanStack Query、react-hook-form / zod、Firebase Web SDKを使用します。

| 対象                                      | 参照先                                         |
| ----------------------------------------- | ---------------------------------------------- |
| pnpm・Node・alias・lint / format・scripts | [tooling](tech-stack/tooling.md)               |
| Vitest・Emulator test・CI                 | [testing and CI](tech-stack/testing-and-ci.md) |
| 検証範囲の選び方                          | [検証ルール](../rules/testing.md)              |
| UI libraryの使い方・themeの現状           | [UI snapshot](frontend/ui.md)                  |

個別libraryのversionは必要なものだけ `package.json` で確認します。
