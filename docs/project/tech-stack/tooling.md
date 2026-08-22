# Current tooling

snapshot metadataは`../tech-stack.md`を参照してください。

## Configuration

- 主な設定は`vite.config.ts`、`tsconfig*.json`、`eslint.config.js`、`prettier.config.mjs`です。
- package managerはpnpm、lockfileはv9です。
- `packageManager`と`engines`はなく、local Node / pnpm versionは`Not established`です。
- CIだけがpnpm `10.28.1`とNode `24`を固定します。
- `@/*` aliasはViteとTypeScriptで`src/*`を指します。
- ESLint flat configはJS / TypeScript recommended、React Hooks、React Refreshを有効化し、type-awareではありません。
- Prettierは`prettier-plugin-tailwindcss`を使い、`src/index.css`と`cn` / `cva`を設定します。
- `pnpm-workspace.yaml`はworkspace一覧ではなくdependency build scriptのallow listです。
- PostCSSとAutoprefixerはありますが、PostCSS設定fileはありません。

## Package scripts

| Command           | Behavior                          |
| ----------------- | --------------------------------- |
| `pnpm dev`        | Vite、port 3000、`strictPort`なし |
| `pnpm build`      | `tsc -b`後にproduction build      |
| `pnpm lint`       | repository全体へESLint            |
| `pnpm format`     | repository全体をPrettierで書換    |
| `pnpm preview`    | build成果物をpreview              |
| `pnpm seed`       | `.env`でEmulatorへseed            |
| `pnpm test`       | Vitest run mode                   |
| `pnpm test:watch` | Vitest watch mode                 |

seedの削除・再作成範囲は`../firebase/emulator-and-deployment.md`を参照してください。
