# Verification and testing rules

変更種別ごとの必須test範囲は`No explicit testing convention found`です。

VitestとReact Testing Libraryの自動test基盤はあります。利用可能なscripts、test配置、CIの現状は`../project/tech-stack.md`を正本とします。以下は既存scriptsと過去の作業結果に基づく`Recommended verification workflow`であり、すべての変更へ同じcommandを必須化する規則ではありません。

## Automated test design

以下は自動テストの追加・変更・削除に適用する規則です。後続の推奨検証手順とは区別します。

- テストは機能上の契約を保証する。操作結果、状態遷移、データ変換、認証・権限、画面遷移、エラー、二重実行防止、アクセシビリティ意味論、安全性を対象にする。
- 機能が同じでも色・余白・配置・装飾の変更だけで壊れるテストは作成しない。CSS class、inline style、レイアウト用DOM階層・slot、装飾SVG、粒子数、animation属性、画面寸法の一致を検証しない。補助的なツールチップ表示だけのテストも作成しない。
- テストの短さや使用APIだけで要否を判断しない。DOM参照やselectorは、Markdownの変換結果や危険なHTMLの除去など、機能・安全性の契約に必要な場合は使用できる。UI操作の対象はrole・accessible nameを優先する。
- ボタンの選択状態や操作不可は、`aria-pressed`や`disabled`などの意味論と操作結果で検証する。装飾色やアイコンを状態の代理指標にしない。
- 文言は確認事項・エラー・処理状態など機能上必要な意味を検証する。装飾コピーや単なる文言の微調整を固定しない。
- テスト名には条件と機能結果を記述する。混在するケースは機能検証を残して表示実装のassertionを除き、目的を失ったケースやassertionのないケースは残さない。
- レスポンシブ、テーマ、余白、配置、装飾、motion、画面上の改行維持は、影響するUI変更時の手動確認として扱う。jsdomのclass一致を実ブラウザでの表示確認として報告しない。

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
