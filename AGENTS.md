# MemoirAI Agent Context Map

このファイルは Codex が最初に読むルーターです。詳細をここへ集約せず、タスクに関係する文書だけを読んでください。

## Project

MemoirAI は React / TypeScript / Vite の SPA です。Firebase Authentication、Cloud Firestore、Cloud Storage、Firebase AI Logic を利用し、UI は shadcn/ui、Radix UI、Tailwind CSS を中心に構成されています。

## Language

- チャット応答とユーザー向け文書は日本語で記述する。
- コード識別子、型名、ファイル名は既存コードに合わせて英語を使う。

## Always read

1. この `AGENTS.md`
2. `docs/index.md`

コードを変更する場合は`docs/rules/coding.md`も読みます。その後は下記の対応表から必要な文書だけを読み、`docs/`を毎回全件読み込まないでください。

## Task routing

| タスク                                  | 追加で読む文書                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 新機能                                  | `docs/workflows/feature.md`、`docs/project/repository-map.md`、関係領域の rules / architecture / project              |
| UI・レスポンシブ・フォーム              | `docs/rules/ui.md`、`docs/architecture/frontend.md`、`docs/project/frontend.md`                                       |
| routing・layout                         | `docs/architecture/frontend.md`、`docs/project/frontend.md`                                                           |
| state・hooks・component構成             | `docs/rules/coding.md`、`docs/architecture/frontend.md`、`docs/project/frontend.md`、`docs/project/repository-map.md` |
| Firebase全般・Emulator・AI Logic        | `docs/rules/firebase.md`、`docs/architecture/data-access.md`、`docs/project/firebase.md`                              |
| Firestore schema・query・Security Rules | 上記に加えて `docs/project/firestore.md`                                                                              |
| Authentication                          | `docs/rules/firebase.md`、`docs/architecture/data-access.md`、`docs/project/firebase.md`、`docs/project/frontend.md`  |
| Storage・日記画像                       | `docs/rules/firebase.md`、`docs/architecture/data-access.md`、`docs/project/firebase.md`                              |
| bugfix                                  | `docs/workflows/bugfix.md`、対象領域の文書                                                                            |
| refactoring                             | `docs/workflows/refactoring.md`、`docs/architecture/overview.md`、対象領域の文書                                      |
| dependency・build・CI                   | `docs/project/tech-stack.md`、`docs/rules/testing.md`                                                                 |
| 検証                                    | `docs/rules/testing.md`                                                                                               |
| Git commit・branch・PR                  | `docs/rules/git.md`。いずれもユーザーから明示的な指示があった場合だけ行う                                             |

表のパスはリポジトリルートからの相対パスです。

## Working rules

- 最初に `git status --short` を確認し、既存の未コミット変更を保護する。
- 事実はコード、設定、履歴から確認する。確認できない設計思想は推測で補わず、`Not established` または `No explicit convention found` と扱う。
- 現状と望ましい設計を混ぜない。改善案を述べる場合は `Recommended` と明示する。
- 変更対象の近接実装を先に読み、既存 component、hook、service、design token を再利用する。
- 差分は依頼範囲に限定し、無関係なリファクタリングや整形を混ぜない。
- Firebase / Firestore の path や公開範囲を推測しない。型、service、rules、seed を照合する。
- 検証結果と未検証項目を分けて報告する。既存の失敗を今回の回帰として扱わない。

## Documentation maintenance

コード変更がCodexのプロジェクト理解に影響する場合だけ、関連するproject文書を同じ変更で更新してください。architecture文書は、コードが偶然変わったときではなく、合意済みの目標構造や責務を変更したときだけ更新します。

- ディレクトリの責務や主要featureが変わる → `docs/project/repository-map.md`
- route、Provider、state、公開/認証境界、主要なfrontend依存が変わる → `docs/project/frontend.md`
- collection、document、主要フィールド、query、rulesが変わる → `docs/project/firestore.md`
- dependency、scripts、build、Firebaseサービス/Emulator構成が変わる → `docs/project/tech-stack.md` または `docs/project/firebase.md`
- 合意済みの依存方向、層の責務、状態管理方針を変える → 関連する `docs/architecture/` 文書

些細なファイル追加、内部的なrename、実装詳細だけの変更ではproject文書を更新しません。人間が決める実装・運用規則を変える場合だけ`docs/rules/`を更新してください。

## Source of truth

- 実行コードと設定が現在状態の一次情報です。
- `docs/rules/` は人間が維持する固定・準固定方針です。
- `docs/architecture/` は人間が合意した目標構造・責務・依存方向です。現在の実装が逸脱していても、実装に合わせて暗黙に変更しません。
- `docs/project/` は変動するスナップショットです。実装と食い違う場合は実装を優先し、文書を更新します。
- `docs/workflows/` は作業手順です。
