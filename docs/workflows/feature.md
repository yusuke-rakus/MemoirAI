# 新機能の手順

1. 期待する挙動、対象画面、対象外、legacy dataの扱いを定め、[AGENTS.md](../../AGENTS.md) から関係文書を選ぶ。
2. 近接するcomponent・hook・gatewayを確認し、[配置マップ](../project/repository-map.md) と対象architectureに沿って配置する。
3. UI、state、非同期処理、外部I/Oの責務を分け、外部入力・AI出力・formのvalidation境界を決める。
4. Firestore / Storage変更ではpath、field、owner、公開範囲、部分失敗時の補償、再試行、legacy互換性を確認する。dependency追加は既存で代替できない理由とbundle / CIへの影響を確認する。
5. 既存consumerの挙動を保って実装し、[検証ルール](../rules/testing.md) に従って確認する。
6. [文書の更新方針](../../AGENTS.md#文書の責務と更新) に従い、該当箇所を更新する。
