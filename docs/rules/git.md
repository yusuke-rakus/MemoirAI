# Git rules

この文書はcommit、branch、Pull Requestの運用ルールです。履歴上の傾向ではなく、このルールを優先します。

## Execution boundary

- branchの作成・切り替え、commit、push、PRの作成・更新、tag操作は、ユーザーが明示した作業範囲で行う。複数の操作をまとめて依頼された場合は、その範囲内で続けて実行する。
- PR作成だけを依頼された場合は、公開済みのhead branchから作成する。準備に追加のbranch作成・切り替え、commit、pushが必要なら、その操作の依頼を受けてから実行する。
- 作業は開始時のワークツリーで進める。別ワークツリーの作成・利用には明示的な依頼が必要。

## Commit

- 1 commitは一つの説明可能な作業単位にする。
- 複数のバグ・機能や、機能変更・設定変更・機械的formatは論理単位で分ける。
- 既存の未コミット変更を無断で含めず、対象を確認してからstageする。
- messageは`type: 日本語の要約`形式にする。
- `type`は変更目的に合わせ、scope付きの`type(scope): ...`は使用しない。

例:

```text
feat: XX機能を追加
fix: XXの不具合を修正
improve: XXの操作性を改善
```

## Branch

- 1 branchは一つの機能・改善など、一つの作業単位にする。
- branch名は `feature/*` または `improve/*` を使い、`*` は英語のkebab-caseにする。機能追加は `feature/*`、改善・修正や保守は `improve/*` を目安とする。

例: `feature/diary-search`、`improve/settings-dialog`

## Pull Request

- 通常の機能・修正・文書変更のbaseは `development`。ユーザーの明示指定がある場合だけ別baseを使う。
- `main` はGitHubのdefault branchでも通常PR先にしない。baseが存在しない・取得できない場合は停止し、別branchへfallbackしない。
- branch作成前にbaseを確定し、PR作成時は `--base` を明示する。作成後の `baseRefName` が指定先と一致することを確認する。
- titleと本文は対象commit・差分から作成する。
- 変更概要、検証結果、既存failure、未確認項目を必要に応じて記載する。
- Pull Request templateはありません。
