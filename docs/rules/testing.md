# 検証ルール

## 実行範囲

- 変更に必要な最小範囲を選ぶ。追加・変更したテストだけで契約を確認できれば、そのテストだけを実行する。
- 既存実装の変更は、その契約・consumerに直接影響する既存テストを対象指定する。共有処理でも、まず影響するテストだけを選ぶ。
- 全テスト、全体lint、buildは完了時の定型手順にしない。ユーザーの明示依頼、広範な基盤変更、対象検証で判明した回帰など、範囲を広げる具体的理由がある場合だけ実行する。
- 失敗を調べるための変更前baselineも対象範囲に限定する。検証成功後は、新しい変更や未解決の懸念がなければ反復・追加しない。

| 変更                                  | 基本の検証                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| docsのみ                              | 変更ファイルのPrettier checkと `git diff --check`。アプリのtest・lint・buildは不要                      |
| TS/TSX                                | `pnpm exec eslint <変更ファイル>`。機能契約を変えた場合は対象テストも実行                               |
| テスト追加・変更 / UI非依存の機能契約 | `pnpm exec vitest run <対象.test.ts>`（複数ファイル指定可）                                             |
| UI・routing                           | 影響する表示・操作・認証状態を手動確認。表示だけの変更に自動テストを追加しない                          |
| Firebase・Rules                       | 影響するowner・非owner・未認証・失敗・legacy caseをEmulatorで確認。既存scriptの対象と起動条件を先に確認 |
| リーガル本文・metadata                | `pnpm legal:check`。関連ロジック変更時だけ対象テストを追加                                              |
| 型・dependency・build設定             | 型整合性やbundleへの影響に応じて `pnpm exec tsc -b` または `pnpm build` を選ぶ                          |

実際のcommand・設定は `package.json` と近接テストが正本。基盤・CIの詳細が必要な場合だけ [testing-and-ci](../project/tech-stack/testing-and-ci.md) を読む。

## 自動テストの対象

- UI非依存の機能契約（データ変換、認証・権限、永続化、外部呼び出し、エラー、二重実行防止、安全性）を保証する。名前には条件と結果を記し、目的を失ったケースやassertionのないケースは残さない。
- component描画、DOM assertion、クリック・キー操作、画面遷移、アクセシビリティ属性、loading / empty / error表示の自動テストは作成しない。
- component内の重要ロジックは純粋関数・hook・serviceへ分離し、そのUI非依存の契約をテストする。Markdown変換やHTML除去も、DOM描画を伴う検証は対象外。
- responsive・theme・配置・motion・文言は影響する場合だけ手動確認する。jsdomの結果を実ブラウザ確認として報告しない。

## 確認と報告

- formatは変更した実pathだけに `pnpm exec prettier --check <変更ファイル>` を実行する。検証目的で全体を書き換える `pnpm format` / `pnpm lint:fix` を使わない。
- trackedのunstaged差分は `git diff --check`、staged差分は `git diff --cached --check`。未追跡ファイルは直接確認と対象format checkを使う。
- 実行commandと結果、warning、未実行項目と理由を簡潔に報告する。失敗は今回の回帰・既存・環境要因に分ける。
- browser・Emulator・productionの未確認をsource inspectionで確認済みとしない。必要な検証を実行できない場合は代替確認と残るriskを記す。
