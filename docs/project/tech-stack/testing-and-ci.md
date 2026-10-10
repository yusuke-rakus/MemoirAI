# Current tests and CI

snapshot metadataは`../tech-stack.md`を参照してください。

## Automated tests

- Vitest、jsdom、React Testing Library、user-event、jest-domを使用します。
- test設定は`vite.config.ts`に統合し、Vite pluginと`@/*` aliasを共有します。
- setupは`src/test/setup.ts`、testは対象実装と同じ責務ディレクトリ内の`__tests__/`に置く`*.test.ts`または`*.test.tsx`です。
- 対象指定の実行例: `pnpm exec vitest run src/features/diaries/hooks/__tests__/useShareDiary.test.ts`。範囲の選び方は[検証ルール](../../rules/testing.md)を参照します。
- coverage、Playwright / Cypressはありません。account削除用Firestore / Storage Rulesは`pnpm test:rules`で起動済みEmulatorに対して検証します。
- `scripts/seed.ts`は件数を検証しますが、自動test suiteではありません。

## CI/CD

`.github/workflows/firebase-hosting.yml`は`main`へのpushでcheckout、pnpm install、`pnpm build`、Hosting deployを実行します。

- CIは`pnpm lint`と`pnpm test`を実行しません。
- deploy対象とcredentialは`../firebase/emulator-and-deployment.md`を正本とします。
