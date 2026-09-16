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

1. 最初に `git status --short` を確認して current working tree を把握する。未コミット変更を自動的に対象外にはせず、依頼範囲と実際の差分から調査対象を決める。
2. `AGENTS.md` と `docs/index.md` を読む。コード変更を伴う提案または実装では、`docs/rules/coding.md` と `docs/workflows/refactoring.md` も読む。
3. 対象層に応じて、関連する architecture と project snapshot を読む。配置は `docs/project/repository-map.md`、frontend の責務は `docs/architecture/frontend.md`、外部 I/O は `docs/architecture/data-access.md` を正本とする。
4. LOC は読む順番を決める目安に留める。対象ファイル、近接実装、consumer、import 方向、公開 props / public method を読んで判断する。

現在の実装から確認できない規約や設計意図は推測せず、`Not established` または `No explicit convention found` と記す。

## 分割判断

次の観点で、同じファイル内の責務群が独立して変更され得るかを確認する。

- **変更理由:** 別のユーザー目的、別の画面・操作、または別のドメイン規則が同居していないか。
- **層・外部境界:** UI composition、feature hook / use-case、純粋ロジック、Firebase・Storage・browser persistence gateway が混在していないか。
- **状態の所有:** state、副作用、非同期処理、Dialog state が最小の owner にあり、同じ生存期間・更新契機を共有しているか。
- **consumer と contract:** 呼び出し元、依存方向、public props / method が同じ変更単位として扱われているか。複数 consumer がないものを早期に shared 化していないか。
- **co-change:** 同時に変更される根拠があるか。単に近接している、または名前が似ていることは根拠にしない。

次の場合は明確な分割候補とする。

- 別のユーザー目的または domain の UI・state・操作が、共通の薄い shell なしに同居する。
- gateway に、外部 I/O と再利用可能な純粋変換・業務規則が混在する。
- hook / use-case に、無関係な workflow、状態、補償処理が同居し、個別にテスト・再利用・変更できる。
- component が rendering を越えて複数 feature の data access や長寿命 state を所有する。

次の場合は分割不要または保留とする。

- 一つのユーザー目的を完結させる page / dialog の orchestration であり、内部の処理が同じ成功条件・失敗条件・ライフサイクルを共有する。
- shader、生成コード、設定表など、ファイル量の大半が単一の技術的成果物である。
- 分割後に props の中継、循環 import、単一 consumer 向けの不自然な抽象化だけが増える。

## MemoirAI の配置境界

- component は UI composition、入力、ユーザー操作の通知を中心にする。複雑な state、副作用、非同期処理は feature hook に置く。
- feature hook / use-case は複数 gateway の順序、成功条件、再試行、補償処理を所有する。toast、navigation、Dialog state は gateway に持ち込まない。
- 純粋な変換・名寄せ・validation・計算は、外部 I/O gateway から分離する。新しい shared utility は実際の複数 consumer と責務を確認してから作る。
- Firestore、Storage、Auth、AI、localStorage、IndexedDB は resource または外部境界ごとの client / gateway に閉じ込める。SDK 固有型を上位層へ漏らさない。
- `src/features/<feature>` から別 feature を import しない。feature 固有のコードは当該 feature に置き、複数 feature または app shell が使う app 固有 UI だけを `src/components/shared` に置く。

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

実装を依頼された場合は、候補ごとに scope を確定してから小さく移行する。分割だけが目的の変更では、route、Firestore / Storage path・field、Security Rules、user-visible behavior を変えず、既存 failure と今回の回帰を分けて報告する。
