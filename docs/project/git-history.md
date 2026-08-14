# Current Git history snapshot

最終確認: 2026-08-14、検証対象のsource snapshot `da479d8`。

この文書はcommit規則ではなく、messageと変更粒度を選ぶための監査スナップショットです。固定ルールは`../rules/git.md`を参照してください。

## Audit scope

- 現在のHEADから到達可能な全132 commit
- 期間: 2025-06-08〜2026-08-14
- merge: 3件
- 非merge: 129件

## Message observations

- 非mergeの121件（93.80%）は`type: summary`形式です。
- prefixは大文字小文字を合わせると`feat` 61件、`fix` 21件、`improve` 13件が多く、`add`、`chore`、`design`、`style`、`refactor`などもあります。
- prefixなしは8件です。
- `type(scope):`形式は確認できませんでした。
- summaryは日本語と英語が混在しています。

この傾向はprefix集合、大文字小文字、言語、scopeを定める規則ではありません。近接する履歴を再確認してmessageを提案してください。

## Change-size observations

直近60件の非merge commit:

| Changed files | Commits |
| ------------- | ------: |
| 1             |      15 |
| 2〜5          |      31 |
| 6〜10         |       8 |
| 11以上        |       6 |

changed-file数の中央値は3です。小さな論理変更が中心ですが、大型featureと全体formatの例外があります。

## Refresh condition

履歴傾向がmessage選択に役立たないほど変わった場合だけ再集計します。commitごとの更新は不要です。
