# Project context index

最初にルートの`AGENTS.md`でタスクを分類し、必要な文書だけを読んでください。`.agent/rules/antigravity.md`は別agent向けの互換入口です。

## Information ownership

| Directory       | Source of truth                                       |
| --------------- | ----------------------------------------------------- |
| `rules/`        | 人間が決める固定・準固定の実装・運用規則              |
| `architecture/` | 合意済みの目標構造、責務、依存方向                    |
| `project/`      | route、schema、dependency、現在の逸脱など実装snapshot |
| `workflows/`    | feature、bugfix、refactoringの作業手順                |

実行コードと設定が現在状態の一次情報です。architectureと実装が異なる場合は設計を暗黙に変えず、差異をprojectへ記録します。

## Rules

- `rules/coding.md`: React / TypeScript、state、配置、error handling
- `rules/git.md`: commit、branch、Pull Request
- `rules/ui.md`: UI、responsive、form、feedback
- `rules/firebase.md`: Firebase、Security Rules、Emulator
- `rules/testing.md`: 静的・手動検証と結果報告

## Architecture

- `architecture/overview.md`: システム境界と依存方向
- `architecture/frontend.md`: frontend各層、state、routing / auth
- `architecture/data-access.md`: gateway、validation、ownership

## Project snapshots

- `project/repository-map.md`: 配置先と責務
- `project/frontend.md`: Provider、routing、state、依存違反、UI
- `project/tech-stack.md`: dependency、tooling、test、CI
- `project/git-history.md`: Git履歴の監査snapshot
- `project/firebase.md`: Firebase、Auth、Storage、AI、Emulator、deploy
- `project/firestore.md`: schema、query、writer、Security Rules、seed

## Workflows

- `workflows/feature.md`、`workflows/bugfix.md`、`workflows/refactoring.md`

各project親文書から必要な詳細だけを選び、同じ情報を別文書へ転載しないでください。不明な方針は`Not established`または`No explicit convention found`と明記します。
