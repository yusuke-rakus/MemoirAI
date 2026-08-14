# Refactoring workflow

refactoringは外部behaviorを維持する構造変更として扱います。behavior変更やmigrationが必要なら、別featureとしてscopeを明示します。

## 1. Define invariants

- 変更前のpublic props、route、user-visible behavior、Firestore/Storage contract、error/loading stateを列挙する。
- consumerとfeature間importを検索し、対象外の依存を把握する。
- `../rules/testing.md`に沿い、必要なsource checkとmanual flowのbaselineを記録する。
- 共通化対象が見た目だけ同じか、責務・生存期間・data contractまで同じか確認する。

## 2. Set a narrow boundary

- file移動、API変更、behavior変更、機械的formatを別の論理単位にする。
- 新しいabstractionは現在の複数consumerに必要な最小interfaceにする。
- 存在しないdomain/repository layerを名前だけ追加しない。
- duplicated implementationを残す場合も、今回のscope外なら無理に統合しない。

## 3. Refactor incrementally

- 先にcompatibilityを保つ新しい境界を作り、consumerを小さい単位で移す。
- Firebase path・field・Security Rulesを変えないrefactorでは、data migrationを発生させない。
- import cycleとfeature-to-feature dependencyの増加を確認する。
- 途中段階でもtype check可能な状態を保つ。

## 4. Verify invariants

- `../rules/testing.md`から変更範囲に合う推奨checkを選ぶ。
- 変更前に列挙したuser flowを同じ条件で確認する。
- automated testがない領域はconsumerごとのmanual checkを強める。
- performance改善を主張する場合は、測定方法とbefore/afterを示す。

## 5. Documentation

- 責務配置や依存方向が変わった場合、`AGENTS.md`の更新matrixに従う。
- route / schema / dependency / Firebase構成など現在実装が不変なら、関係する`../project/`は更新しない。
- 合意済みの責務や依存方向を変えず、実装を既存architectureへ近づけるだけなら`../architecture/`は更新しない。設計判断自体を変えた場合だけ更新する。
