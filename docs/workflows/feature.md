# Feature workflow

新機能を追加する手順です。実装規則は`../rules/`、合意済みの目標構造は`../architecture/`、現在の実装は`../project/`を正本にします。

## 1. Define the boundary

- ユーザーが求めるbehavior、対象画面、対象外、legacy dataへの期待を整理する。
- `AGENTS.md`のrouting tableから関係文書だけを読む。
- route、Firestore path、公開範囲、dependency追加を伴うか先に判定する。

## 2. Find the nearest pattern

- 同じinteractionまたはdata flowを持つsibling component / hook / gatewayを探す。現在の逸脱を新しい依存の前例にしない。
- `../project/repository-map.md`で配置先を決める。
- UIは既存primitive/token、Firebaseは既存client/rulesを優先する。
- 新しいlayerや共通componentは、複数consumerが確認できる場合だけ追加する。

## 3. Design the change

- UI、state、async logic、data accessの責務を分け、`../architecture/`の依存方向に従う。
- Firestore/Storageを変える場合はpath、field、owner、read/write、rollback、legacy fallbackを列挙する。
- 外部入力・AI output・form valueのvalidation boundaryを決める。
- 新dependencyが必要なら、既存dependencyでは代替できない理由とbundle/CIへの影響を確認する。

## 4. Implement

- 既存consumerとlegacy dataのbehaviorを保ち、必要な境界だけを小さい単位で変更する。

## 5. Verify and document

- `../rules/testing.md`から変更範囲に合う推奨checkを選ぶ。
- UIならresponsive/theme/accessibility、FirebaseならEmulatorとfailure cleanupを関係範囲で確認する。
- 現在実装が変わった場合だけ関係する`../project/`を更新する。設計判断自体を変更した場合だけ`../architecture/`を更新する。
- 最終報告では変更file、behavior、検証結果、既存failure、未確認項目を分ける。

commitは自動で行わず、依頼された場合に`../rules/git.md`へ進みます。
