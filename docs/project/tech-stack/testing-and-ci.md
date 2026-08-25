# Current tests and CI

snapshot metadataは`../tech-stack.md`を参照してください。

## Automated tests

- Vitest、jsdom、React Testing Library、user-event、jest-domを使用します。
- test設定は`vite.config.ts`に統合し、Vite pluginと`@/*` aliasを共有します。
- setupは`src/test/setup.ts`、testは対象に隣接する`*.test.ts`または`*.test.tsx`です。
- 代表testは`useShareDiary`と`DiaryDeleteDialog`を対象にします。
- coverage、Playwright / Cypressはありません。account削除用Firestore / Storage Rulesは`pnpm test:rules`で起動済みEmulatorに対して検証します。
- `scripts/seed.ts`は件数を検証しますが、自動test suiteではありません。

## CI/CD

`.github/workflows/firebase-hosting.yml`は`main`へのpushでcheckout、pnpm install、`pnpm build`、Hosting deployを実行します。

- CIは`pnpm lint`と`pnpm test`を実行しません。
- deploy対象とcredentialは`../firebase/emulator-and-deployment.md`を正本とします。

## Existing README

`README.md`のsetup、Docker Emulator、`pnpm seed`の説明はcurrent filesと対応します。後半のtype-aware ESLintとReact pluginのsectionはVite template由来の推奨例で、現在のESLint設定ではありません。
