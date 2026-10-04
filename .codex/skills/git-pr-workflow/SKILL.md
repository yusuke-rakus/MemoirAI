---
name: git-pr-workflow
description: MemoirAI の変更をプロジェクト規約に沿ったブランチと論理単位のコミットへ整理し、検証結果を記載した GitHub PR を作成する。ユーザーが branch・commit・push・PR の操作を明示的に依頼したときに使う。
---

# Git変更整理とPR作成

MemoirAI の作業ツリーをレビュー可能なコミットと GitHub PR に整理する。依頼された操作だけを行う。通常の実装依頼やスキルの選択を、branch 作成、commit、push、PR 作成の許可と解釈しない。すでに明示された許可を重ねて確認しない。

## 準備と対象差分

1. `git status --short` を最初に確認し、`git rev-parse --show-toplevel` で MemoirAI のルートを確認する。別プロジェクトは変更しない。
2. `AGENTS.md`、`docs/index.md`、`docs/rules/git.md` を読む。検証を行う場合は `docs/rules/testing.md` と `docs/project/tech-stack.md` の必要な詳細を読む。実装の追加修正が必要なら、`docs/rules/coding.md` と対象領域の文書も読む。
3. 現在の branch、`git diff`、`git diff --cached`、未追跡ファイル、既存の branch 固有 commit を確認する。未追跡ファイルは内容も確認する。秘密情報の値は出力へ転載しない。
4. 今回の目的、含める差分、影響範囲、必要な検証を確定する。既存の未コミット変更は依頼範囲と照合し、無断で取り込まない。異なる目的の変更を区別できない場合は、判定が必要な差分を示して確認する。

## base と branch

- PR の base はユーザー指定とリポジトリの最新ルールを優先する。指定がなければ remote の default branch と既存 PR を確認する。`git symbolic-ref refs/remotes/origin/HEAD` や `gh repo view --json defaultBranchRef` を利用し、`develop` を別プロジェクトから引き継がない。base を確認できなければ推測して作成しない。
- remote とその接続先を確認し、選んだ remote/base を fetch して比較を更新する。fetch・認証・ネットワークに失敗した場合は、古い ref で最新確認済みと報告せず、依存する操作を止める。
- 新規 branch は `feature/<english-kebab-case-summary>` または `improve/<english-kebab-case-summary>` とする。機能追加は `feature/`、既存機能の改善・修正やその他の保守は `improve/` を目安に、一つの作業単位を表す具体名を選ぶ。
- 現在の作業 branch の目的、既存 commit、base との差分が依頼と一致する場合は再利用する。新規 branch 作成の許可がなければ、その操作を追加しない。
- default/base branch への直接 commit・push はこの PR ワークフローでは行わない。新規 branch が必要な場合は、変更を安全に維持できる方法を選ぶ。退避・復元が必要なら未追跡ファイルも保護し、復元を確認するまで退避を破棄しない。競合したら変更を保持して止める。
- 同名 branch や無関係な既存 commit があれば目的と履歴を確認する。履歴を勝手に rebase、reset、amend、削除して整えない。対象外 commit を含む PR になる場合は、含め方を確認する。
- PR 作成前に、対象リポジトリを指定した `gh pr list --head <branch> --state open` で重複を確認する。同じ head/base の PR は再利用して URL を報告し、本文更新は依頼範囲内の場合だけ行う。異なる base の既存 PR は勝手に宛先を変更しない。

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

`package.json`、設定、近接テストを一次情報にして command を選ぶ。次は `Recommended verification workflow` であり、すべての変更への一律必須化ではない。存在しない `typecheck`、API 契約、E2E script を別プロジェクトから持ち込まない。

| 変更                     | 検証の目安                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| TS/TSX                   | `pnpm exec eslint <対象path>` を先に実行                                                              |
| source/config            | `pnpm lint` と `pnpm build` を独立して実行。build は legal check、TypeScript check、Vite build を含む |
| UI に依存しない機能契約  | 関連する Vitest を対象指定で実行し、影響範囲に応じて `pnpm test`                                      |
| UI・routing              | 影響する viewport、theme、操作、認証状態、直接 URL などを実ブラウザで手動確認                         |
| Firebase・Security Rules | Emulator と対象領域の既存検証手順。`pnpm test:rules` の対象と起動条件を確認して必要な場合だけ実行     |
| リーガル文書             | `pnpm legal:check`。version 同期が必要なら既存手順に沿い、その変更もレビュー                          |
| docs/skill のみ          | `pnpm exec prettier --check <対象path>`。アプリ build は不要。スキル検証が利用可能なら実行            |

- 新しい自動テストは `docs/rules/testing.md` の UI 非依存の契約に限定する。UI 表示・操作確認を DOM assertion で代替しない。
- 検証目的で `pnpm lint:fix` や `pnpm format` を実行しない。必要な修正は対象範囲に限定する。
- tracked の unstaged 差分は `git diff --check`、staged 差分は `git diff --cached --check` で確認する。未追跡ファイルはこれらに含まれないため、対象 path の format check と直接確認を行う。
- 実行 command、成功・失敗、warning、未実行理由を記録する。今回の回帰、既存 baseline の失敗、環境要因を分け、source inspection を browser/Emulator での確認済みと書かない。
- 今回の回帰は依頼範囲内で修正して再検証する。既存・環境由来の失敗は無関係な修正へ広げない。必要な検証が未完了なら Ready PR にせず、原因と残る確認を明示する。ユーザーが Draft PR を依頼している場合は、その状態で作成できる。

## push と PR

1. push・PR 作成が依頼されていることと `gh auth status` を確認する。対象変更が commit 済みで、base との差分・commit 列に対象外変更や競合がないことを確認する。対象外の未コミット変更は削除せず残してよい。
2. `git log <remote>/<base>..HEAD --oneline` と `git diff <remote>/<base>...HEAD` を確認する。正しい head・base・接続先を使い、`git push --set-upstream <remote> <branch>` で通常 push する。force push はしない。
3. PR タイトルは最終差分全体を表す `type: 日本語の具体的な変更内容` とする。本文は日本語で、次の項目から変更に必要な情報を記す。

   ```markdown
   ## 変更概要・理由

   ## 影響範囲

   ## 実行した検証

   ## 未実行・失敗した検証

   ## 注意事項・既知の制約
   ```

4. 本文は一時ファイルへ正確な改行で保存し、`gh pr create --base <base> --head <branch> --title <title> --body-file <file>` を使う。Draft 指定があれば `--draft` を付ける。結果が不明な失敗では既存 PR を再確認してから再試行し、重複を作らない。
5. 作成した PR は利用可能な `attach_artifact` ツールでこのチャットへ添付する。既存 PR の更新・継続を依頼された場合も添付する。
6. `gh pr view` で URL・base・head・Draft 状態を確認し、required checks がある場合はすべての成功を確認する。pending は成功と報告しない。PR 向け check がない場合もローカル検証結果を報告する。

PR の merge、Ready 状態への変更、branch 削除、deploy は別途明示的に依頼された場合だけ行う。現在の Hosting workflow は `main` への push で deploy するため、PR 作成に伴って merge や直接 push を追加しない。実行時には最新の workflow を確認する。

## 完了報告

branch、作成した commit と目的、PR URL と base、検証結果・未確認項目、残した対象外変更を簡潔に報告する。途中で止めた場合は、完了済みの操作と次に必要な情報を示す。
