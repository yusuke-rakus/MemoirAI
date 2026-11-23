---
name: git-pr-workflow
description: MemoirAI の変更をプロジェクト規約に沿ったブランチと論理単位のコミットへ整理し、検証結果を記載した GitHub PR を作成する。ユーザーが branch・commit・push・PR の操作を明示的に依頼したときに使う。
---

# Git変更整理とPR作成

MemoirAI の変更をレビュー可能なコミットと GitHub PR にまとめる。[Gitの実行範囲](../../../docs/rules/git.md#execution-boundary) に従い、依頼に含まれる操作の手順を使う。

## 準備と対象差分

1. `git status --short` を最初に確認し、`git rev-parse --show-toplevel` で MemoirAI のルートを確認する。別プロジェクトは変更しない。
2. `AGENTS.md` と `docs/rules/git.md` を読む。検証時は `docs/rules/testing.md`、索引や設定が必要な場合だけ `docs/index.md` / `docs/project/tech-stack.md` の該当詳細を読む。実装の追加修正が必要なら、`docs/rules/coding.md` と対象領域の文書も読む。
3. 現在の branch、`git diff`、`git diff --cached`、未追跡ファイル、既存の branch 固有 commit を確認する。未追跡ファイルは内容も確認する。秘密情報の値は出力へ転載しない。
4. 今回の目的、含める差分、影響範囲、必要な検証を確定する。既存の未コミット変更は依頼範囲と照合し、無断で取り込まない。異なる目的の変更を区別できない場合は、判定が必要な差分を示して確認する。

## base と branch

- 新規PRでは [PRのbase規則](../../../docs/rules/git.md#pull-request) に従ってbaseを確定する。指定名が実在名と異なる場合はbranch一覧と文脈を確認し、判断できなければ確認する。
- remoteと接続先を確認し、baseをfetchする。公開済みheadから作成する場合はheadもfetchする。取得できない場合は、最新の比較結果が必要な操作を止める。
- 新規PR用のbranch作成も依頼されていれば、現在のワークツリーで最新化したbaseのremote refから [命名規則](../../../docs/rules/git.md#branch) に従って作成する。PR作成のみで、公開済みheadに依頼の差分が揃っていなければ、必要な操作を示して止める。
- default/base branchへの直接commit・pushはこの手順の対象外。新規branchに変更を移す場合は未追跡ファイルも保護し、復元を確認してから退避を破棄する。競合したら変更を保持して止める。
- 同名branchや無関係な既存commitがあれば目的と履歴を確認する。rebase、reset、amend、branch削除で履歴を整理する前に依頼範囲を確認する。対象外のcommitを含むPRになる場合は、含め方を確認する。
- PR作成前に、対象リポジトリを指定して `gh pr list --head <branch> --state open` で重複を確認する。同じhead/baseのPRがあればURLを報告し、更新は依頼の範囲で行う。異なるbaseのPRがあれば状況を確認する。

## 論理単位の commit

- 一つの commit は一つの説明可能な変更にする。ファイル数や行数で機械的に分割しない。実装と、その契約を保証するテスト・必要な文書は、分離すると成立しないなら同じ commit に含める。
- 対象ファイルまたは hunk を明示して stage する。既存の staged 変更も確認し、対象外の変更を巻き込まない。
- 各 commit 前に `git diff --cached`、`git diff --cached --check`、`git status --short` で対象範囲と検証結果を確認する。生成物、ログ、秘密情報、環境設定ファイル、無関係な整形を含めない。
- `docs/rules/git.md` に従い、scope を付けず `type: 日本語の要約` にする。type は英語で変更目的を表し、説明は具体的に記す。

  ```text
  feat: 日記検索を追加
  fix: 日記画像削除時の失敗処理を修正
  docs: GitとPRの作業スキルを追加
  ```

- 「更新」「修正」「作業」だけの説明にしない。依存関係が成立する順に commit し、検証で必要になった修正も履歴を書き換えず論理単位で追加する。

## 変更に応じた検証

[検証ルール](../../../docs/rules/testing.md) に従う。必要な検証が未完了のときはReadyでの作成を保留し、理由と残る確認を示す。Draft PRを依頼されている場合はDraftで作成できる。

## push と PR

1. PRを作成する場合は `gh auth status` とbaseの実在を確認する。pushする場合はローカルbranch、公開済みbranchから作成する場合は取得したremoteのbranchをheadとして、`git log <remote>/<base>..<head> --oneline` と `git diff <remote>/<base>...<head>` を確認する。対象変更が揃い、対象外のcommitや差分が混ざっていないことを確かめる。
2. pushも依頼されていれば、対象のcommitと接続先を確認して `git push --set-upstream <remote> <branch>` で通常pushする。force pushは行わない。PR作成前に、公開されたheadが確認したcommitと一致することを確かめる。
3. PRタイトルは最終差分を表す `type: 日本語の具体的な変更内容` とする。本文は日本語で、次の項目から変更に必要な情報を記す。

   ```markdown
   ## 変更概要・理由

   ## 影響範囲

   ## 実行した検証

   ## 未実行・失敗した検証

   ## 注意事項・既知の制約
   ```

4. 本文は一時ファイルへ正確な改行で保存し、`gh pr create --base <base> --head <branch> --title <title> --body-file <file>` を使う。Draft 指定があれば `--draft` を付ける。結果が不明な失敗では既存 PR を再確認してから再試行し、重複を作らない。
5. チャットにPRを添付できる環境では、作成・更新したPRを添付する。
6. `gh pr view` で URL・`baseRefName`・head・Draft 状態を取得し、`baseRefName` が確定したbaseと一致することを確認する。不一致は完了扱いにせず、作成したPRがopenなら `gh pr edit --base <確定したbase>` で訂正して再確認する。merged / closedなら変更せず状況を報告する。required checks がある場合はすべての成功を確認する。pending は成功と報告しない。PR 向け check がない場合もローカル検証結果を報告する。

PR の merge、Ready 状態への変更、branch 削除、deploy は別途明示的に依頼された場合だけ行う。現在の Hosting workflow は `main` への push で deploy するため、PR 作成に伴って merge や直接 push を追加しない。実行時には最新の workflow を確認する。

## 既存PRの更新

依頼されたPRの番号またはURLで `gh pr view` を実行し、リポジトリ・head・baseを確認する。変更する項目に応じて `gh pr edit` を使い、依頼範囲内で差分を追加する場合は、そのPRのhead branchを使用する。PRの読み取りと更新には、確認したリポジトリを指定する。更新後に対象項目を再確認する。

## 完了報告

branch、作成した commit と目的、PR URL と base、検証結果・未確認項目、残した対象外変更を簡潔に報告する。途中で止めた場合は、完了済みの操作と次に必要な情報を示す。
