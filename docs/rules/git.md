# Git rules

この文書はcommit、branch、Pull Requestの運用ルールです。履歴上の傾向ではなく、このルールを優先します。

## Execution boundary

- commit、branch作成、Pull Request作成は、ユーザーから明示的な指示があった場合だけ行う。
- 指示を受けたら対象差分を確認し、依頼された操作だけを行う。
- 実装完了をGit操作の許可と解釈しない。

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
- branch名は`feature/*`または`improve/*`を使い、`*`は英語のkebab-caseにする。

例: `feature/diary-search`、`improve/settings-dialog`

## Pull Request

- titleと本文は対象commit・差分から作成する。
- 変更概要、検証結果、既存failure、未確認項目を必要に応じて記載する。
- Pull Request templateはありません。
