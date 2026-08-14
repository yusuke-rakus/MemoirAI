# Coding rules

この文書は固定・準固定の実装方針です。作業範囲と未コミット変更の扱いは`AGENTS.md`、現在の配置は`../project/repository-map.md`を正本とします。

## React and state

- function componentとhooksを使用し、class componentは追加しない。
- componentはUI compositionを中心にし、複雑なstate、副作用、非同期処理はfeature hookへ分離する。
- feature固有stateはfeature内、複数featureまたはlayoutで共有するstateだけをapp-wide store / Contextへ置く。
- stateの共有範囲と生存期間を確認し、最小の所有者を選ぶ。
- store actionへ外部I/Oを追加する場合は、hook / gateway境界への影響を設計変更として確認する。

## TypeScript

- `any`は型が得られない外部境界に限定し、その境界を狭くする。
- app横断型は`src/types`、feature固有型はfeature内へ置く。
- react-hook-form + zodを使う既存formではschemaと推論型を再利用・拡張する。
- Promise chainより`async/await`を優先する。
- `tsconfig.app.json`のstrict設定を前提とし、型エラーをcastだけで隠さない。

## Imports and naming

- 別treeからのimportには`@/*` alias、同じfeature内では近接実装のrelative importを踏襲する。
- `src/features/<feature>`から別featureをimportしない。
- 共有UI、型、hook、state、utilityは現在の複数consumerと責務を確認してapp-wide層へ切り出す。
- layoutはfeature entryを構成できますが、feature固有logicを所有しない。
- componentはPascalCase、hookは`use` prefix、既存data-access classは`*Client`に合わせる。
- import順と包括的なfile naming規則: `No explicit convention found`。
- 無関係な既存fileを今回の命名に合わせてrenameしない。

## Error handling

- ユーザー操作の失敗はlocal / inline stateと必要に応じたsonnerの`toast.error`で伝える。
- `alert`を主要なerror UXにしない。
- `console.error`は診断用で、ユーザー通知の代わりにしない。
- 成功通知は既存flowに合わせて`toast`、`toast.success`、`toast.promise`から選ぶ。
- serviceはtyped resultを返すか例外をthrowし、callerが失敗を扱えるようにする。

## Formatting and placement

- Prettierと`prettier-plugin-tailwindcss`に従い、条件付きclassは`cn`を使う。
- format-onlyの変更は機能変更と分離する。
- 配置は`../project/repository-map.md`、目標境界は`../architecture/frontend.md`と`../architecture/data-access.md`を確認する。
- 現在の逸脱を前例にせず、無関係な変更で一括refactorしない。
