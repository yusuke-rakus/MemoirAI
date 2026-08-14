# Verification and testing rules

変更種別ごとの必須test範囲は`No explicit testing convention found`です。

VitestとReact Testing Libraryの自動test基盤はあります。利用可能なscripts、test配置、CIの現状は`../project/tech-stack.md`を正本とします。以下は既存scriptsと過去の作業結果に基づく`Recommended verification workflow`であり、すべての変更へ同じcommandを必須化する規則ではありません。

## Recommended baseline

- 変更前に対象領域の既知状態を確認する。
- `package.json`、test設定、対象に近いtestを確認してcommandを選ぶ。
- 既存failureと今回の回帰を分けるため、全体checkと変更fileへのtargeted checkを区別する。

## Recommended static verification

- TS/TSXを変更した場合は、対象fileを指定したESLintを先に実行する。
- source/config変更に関係する場合は`pnpm lint`と`pnpm build`を独立して実行し、一方の失敗を理由に他方を省略しない。docs-only変更にbuildは不要です。
- format確認は実pathを指定する。例: `pnpm exec prettier --check AGENTS.md docs`。
- `pnpm format`はrepository全体を書き換えるため、読み取り専用の検証として実行しない。
- unstaged tracked diffには`git diff --check`、staged diffには`git diff --cached --check`を使う。untracked fileはこれらに含まれないため、Prettier checkや直接確認で検証する。

## Recommended behavior verification

- UI変更は対象viewport、light/dark、keyboard操作、loading/empty/errorのうち影響するcaseを確認する。
- routing変更は直接URL、redirect、認証済み/未認証、browser backを必要範囲で確認する。
- Firestore / Auth / Storage変更はEmulatorを優先し、owner、非owner、未認証、欠損data、legacy dataから関係するcaseを選ぶ。
- 画像変更はupload、表示、削除、途中失敗時cleanupを変更範囲に応じて確認する。
- AI出力はJSON parse成功だけでなく、永続化直前に期待する意味・fieldが守られるかを確認する。

## Recommended reporting

- 実行したcommandと成功/失敗を記載する。
- failureは今回の変更、既存baseline、環境要因に分類する。
- browser / Emulator / productionで未確認の項目は、source inspectionだけで確認済みと書かない。
- 自動testを追加できない場合は、代替した手動確認と残るriskを明示する。
- build warningやlint warningを黙って成功扱いせず、変更との関連を説明する。

CIで実行されるcheckだけを品質基準にしません。現在のCI内容は`../project/tech-stack.md`と`../project/firebase.md`を確認してください。
