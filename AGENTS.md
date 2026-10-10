# MemoirAI Agent Context

React / TypeScript / Vite SPA。Firebase（Auth / Firestore / Storage / AI Logic）、shadcn/ui、Radix、Tailwindを使用します。

## 読み込み

- 最初にこの文書と `git status --short` を確認し、既存変更を保護する。
- コード変更時は `docs/rules/coding.md`、検証時は `docs/rules/testing.md` を読む。
- 下表から変更に関係する文書だけを選ぶ。索引が必要なら `docs/index.md` を読む。同じ作業中に既読文書を読み直さず、親文書・配下の詳細を一括で読まない。

表内のパスは `docs/` からの相対パスです。

| 対象                           | 参照先                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| 新機能 / bugfix / refactoring  | 該当する `workflows/feature.md` / `bugfix.md` / `refactoring.md`                              |
| 配置・責務・state              | `project/repository-map.md`、`architecture/frontend.md`、必要なら `project/frontend/state.md` |
| UI・フォーム                   | `rules/ui.md`、`project/frontend/ui.md`                                                       |
| routing・layout・認証境界      | `architecture/frontend.md`、`project/frontend/routing.md`                                     |
| Firebase・外部I/O              | `rules/firebase.md`、`architecture/data-access.md`、`project/firebase.md` から該当詳細        |
| Firestore schema・query・Rules | 上記に加え `project/firestore.md` から対象resourceの詳細                                      |
| dependency・build・CI          | `project/tech-stack.md` から該当詳細                                                          |
| Git操作                        | `rules/git.md`。commit・push・branch作成・tag・PRは明示依頼時だけ                             |

## 作業方針

- 応答・ユーザー向け文書は日本語。識別子・ファイル名は既存の英語命名に合わせる。
- 現在状態の正本はコード・設定・履歴。未確認の方針は `Not established` / `No explicit convention found`、改善案は `Recommended` と明示する。
- 近接実装を先に確認し、既存component・hook・gateway・tokenを再利用する。無関係な変更・整形を混ぜない。
- Firebaseのpath・公開範囲は型・client・Rules・seedで確認し、推測しない。
- 検証は変更に必要な最小範囲。追加・変更したテストを対象指定し、直接影響する既存テストだけを必要に応じて追加する。全テスト・全体lint・buildを作業終了時に一律実行しない。詳細は `docs/rules/testing.md`。
- 実行結果と未検証を分け、既存失敗を今回の回帰と扱わない。

## 文書の責務と更新

- `rules/`: 人間が決める実装・運用方針。方針を変更したときだけ更新する。
- `architecture/`: 合意済みの目標構造・依存方向。実装の逸脱に合わせて暗黙に変更しない。
- `project/`: 現在の実装snapshot。コードを優先し、構造理解が変わる場合だけ該当文書を更新する。
- `workflows/`: 作業手順。重複する規則は転載せず参照する。

projectの更新先: 配置・主要feature → `repository-map.md`、route・Provider・state・認証境界 → `frontend/`、schema・query・Rules → `firestore/`、dependency・scripts・build → `tech-stack/`、Firebase構成 → `firebase/`。内部renameや実装詳細だけの変更では更新不要。
