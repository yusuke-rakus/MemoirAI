# MemoirAI Agent Context

React / TypeScript / Vite SPA。Firebase（Auth / Firestore / Storage / AI Logic）、shadcn/ui、Radix、Tailwindを使用します。

## 読み込み

- 最初にこの文書と `git status --short` を確認し、既存変更を保護する。
- コード変更前に [実装ルール](docs/rules/coding.md)、検証前に [検証ルール](docs/rules/testing.md) を読む。
- 作業に該当する行だけを使い、詳細は必要なリンクへ直接進む。全体の索引が必要なときは [文書索引](docs/index.md) を使う。作業中は既読文書を読み直さず、親文書と配下を一括で読まない。

| 対象                                   | 最初に読む規則・手順                                                                                                                             | 影響に応じて読む資料                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能追加・不具合修正・リファクタリング | 該当する [機能追加](docs/workflows/feature.md)、[不具合修正](docs/workflows/bugfix.md)、[リファクタリング](docs/workflows/refactoring.md) の手順 | コード変更の対象に応じて以下を参照                                                                                                                                                    |
| 配置・責務・状態                       | [実装ルール](docs/rules/coding.md)                                                                                                               | 配置先は [配置マップ](docs/project/repository-map.md)、層の境界は [Frontend設計](docs/architecture/frontend.md)、既存の状態は [状態管理](docs/project/frontend/state.md)              |
| UI・フォーム                           | [UIルール](docs/rules/ui.md)                                                                                                                     | 既存の部品や画面例は [UIの実装](docs/project/frontend/ui.md)                                                                                                                          |
| routing・layout・認証境界              | [Frontend設計](docs/architecture/frontend.md#routing-and-authentication)                                                                         | 既存の経路や認証境界は [routingの実装](docs/project/frontend/routing.md)                                                                                                              |
| Firebase・外部I/O                      | [Firebaseルール](docs/rules/firebase.md)                                                                                                         | gatewayや複数操作の境界は [データアクセス設計](docs/architecture/data-access.md)。初期化・Auth・Storage・AI・Emulatorは [Firebaseの詳細](docs/project/firebase.md) から該当項目へ進む |
| Firestore schema・query・Rules         | [Firebaseルールのデータ変更](docs/rules/firebase.md#security-and-data-changes)                                                                   | [Firestore索引](docs/project/firestore.md#detailed-snapshots) から対象resourceの詳細へ進む                                                                                            |
| dependency・build                      | [tooling](docs/project/tech-stack/tooling.md)                                                                                                    | CIへの影響は [testing and CI](docs/project/tech-stack/testing-and-ci.md)                                                                                                              |
| CI                                     | [testing and CI](docs/project/tech-stack/testing-and-ci.md)                                                                                      | ビルドやスクリプトの詳細は [tooling](docs/project/tech-stack/tooling.md)                                                                                                              |
| Git操作                                | [Gitの実行範囲](docs/rules/git.md#execution-boundary)                                                                                            | 依頼された操作に関係するブランチ・コミット・PRの規則                                                                                                                                  |

## 作業方針

- 応答・ユーザー向け文書は日本語。識別子・ファイル名は既存の英語命名に合わせる。
- 現在状態の正本はコード・設定・履歴。未確認の方針は `Not established` / `No explicit convention found`、改善案は `Recommended` と明示する。
- 近接実装を先に確認し、既存component・hook・gateway・tokenを再利用する。無関係な変更・整形を混ぜない。
- Firebaseのpath・公開範囲は型・client・Rules・seedで確認し、推測しない。

## 文書の責務と更新

- `rules/` は、人間が決める実装・運用方針と合意した方針変更を記録する。
- `architecture/` は、合意済みの目標構造と依存方向を記録する。目標設計の変更は合意を得て反映する。
- `project/` は、現在の実装を案内する。構造の理解や外部契約に関わる変更を反映する。
- `workflows/` は、作業手順を示す。

- 文書を追加・変更する前に、対象の機能名やコマンド名で既存の記述を探す。同じ規則・手順の詳細は一箇所に置き、他の文書にはその場で必要な要約と参照リンクを置く。
- 挙動・設定・コマンド・運用方針を変えた場合は、完了前に `README.md`、`docs/`、エージェント向け文書から関連記述を探し、影響する箇所を同じ作業で更新する。操作の許可条件が変わる場合は、規則を参照するスキルの手順も照合する。

既存文書の誤記は、現行コード・設定または合意済みの方針を確認して、該当箇所で訂正する。実装の説明には確認に使ったコード・設定への相対リンクを添える。確認日やcommitを記す場合は、確認した文書や節の範囲を明示する。

実装の説明を更新する文書は [文書索引](docs/index.md) の「現在の配置」「現在の実装・設定」から選ぶ。
