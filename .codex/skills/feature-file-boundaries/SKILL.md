---
name: feature-file-boundaries
description: MemoirAI の責務が混在したファイルを監査し、根拠のある分割境界と段階的なリファクタリング計画を作成する。ファイル肥大化、feature 境界、component・hook・gateway の責務整理で使用する。
metadata:
  short-description: MemoirAI の責務境界を監査して分割計画を作る
---

# Feature File Boundaries

MemoirAI において、責務が混在したファイルを特定し、挙動を変えない分割計画を作成する。成果物は監査報告または実装可能な計画であり、コード分割そのものはユーザーが明示的に依頼した場合だけ行う。

## 適用範囲

次の依頼で使用する。

- feature の境界、責務分割、単一責務、ファイル肥大化を調査・整理する依頼
- component、hook、service client、gateway に複数の独立した変更理由があるかを確認する依頼
- 既存コードを変更せず、リファクタリング候補または実装順を作る依頼

行数だけを理由にした機械的な分割、見た目だけが共通した UI の共通化、無関係な一括 rename には使用しない。

## 調査の準備

1. `git status --short` でワークツリーを確認し、依頼と差分から対象を決める。
2. [AGENTS.md](../../../AGENTS.md) と [ファイルの責務分割の基準](../../../docs/rules/coding.md#file-responsibility-boundaries) を読む。配置案には [配置マップ](../../../docs/project/repository-map.md)、層をまたぐ変更には [Frontend設計](../../../docs/architecture/frontend.md) または [データアクセス設計](../../../docs/architecture/data-access.md) を参照する。
3. 対象と近接実装、consumer、import方向、公開propsやmethodを確認する。co-changeを根拠にする場合は対象の差分履歴を確認する。共通の成功条件・失敗条件を変更した際に、同じ箇所を一緒に変える必要があるかを調べる。

生成コードや設定表などでは、ファイルの長さが単一の成果物に由来するかを確認する。

実装を依頼された場合は [リファクタリング手順](../../../docs/workflows/refactoring.md) に従う。

## ディレクトリとテストの配置

- 配置案は対象 feature または component のルートを起点とする tree で示す。`hooks`、画面専用 component、状態表示、テストの配置先を曖昧にしない。
- 画面入口は既存の export 名・props・import 先を保ち、取得状態に応じた表示と表示領域の組み立てを担当する。意味のある表示領域は画面専用の subdirectory にまとめられるが、すべての小部品を個別ファイルへ分けることは目的にしない。
- URL 同期、画面遷移、選択状態などの画面制御を分ける必要がある場合は、当該 feature 直下の `hooks/use-<screen>-controller.ts` に置く。既存 API hook を呼び、取得状態・選択値・用途別操作を返す。panel は値と callback を props で受け取り、URL や server data を別の local state に複製しない。
- loading / empty state は必要に応じて画面専用の状態表示へまとめる。既存の error UI と retry の接続を入口に残すことは許容する。
- 実装とテストの混在解消も scope に含まれる場合は、対象 component 近傍の `__tests__/` へ既存テストをまとめることを既定とする。指定された対象以外のテストや責務分割まで広げず、検出設定が新配置を拾えるなら変更しない。
- テスト移動時は相対 import、mock 対象、fixture・ファイル読取 path を確認する。統合テストを分割後の小部品単位に機械的に分解せず、移行前後の観測可能な画面挙動を中心に維持する。

## 報告と分割計画

調査結果を次の3区分で提示する。

1. **明確な分割候補:** 独立した責務と境界違反の証拠があるもの。
2. **分割余地はあるが凝集しているもの:** 変更コストは高いが、現在は一つのユーザー目的または transaction に収まるもの。
3. **分割不要:** LOC は多くても、技術的またはドメイン上の凝集が確認できるもの。

明確な候補ごとに、以下を短く具体的に示す。

- 現在同居している責務群と、独立して変更される根拠
- Recommended の分割境界、配置先、責務名
- 新旧 consumer をつなぐ最小 public interface。不要な汎用化や feature 間 import は作らない
- 互換性を維持する移行順。不変とする props、route、Firestore / Storage contract、loading・error・成功時の挙動
- 対象に近いテスト、静的 check、必要な手動 flow
