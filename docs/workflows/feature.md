# 新機能の手順

1. 期待する挙動、対象画面、対象外、legacy dataの扱いを定め、`AGENTS.md`から関係文書だけを読む。
2. 近接するcomponent・hook・gatewayを確認し、[配置マップ](../project/repository-map.md)と対象architectureに沿って配置する。既存の依存違反を前例にせず、共通化は現在の複数consumerが必要な場合だけ行う。
3. UI、state、非同期処理、外部I/Oの責務を分け、外部入力・AI出力・formのvalidation境界を決める。
4. Firestore / Storage変更ではpath、field、owner、公開範囲、部分失敗時の補償、再試行、legacy互換性を確認する。dependency追加は既存で代替できない理由とbundle / CIへの影響を確認する。
5. 既存consumerの挙動を保って実装し、[検証ルール](../rules/testing.md)に従い追加・変更したテストと直接影響する確認だけを実行する。
6. 構造理解が変わる場合だけ `AGENTS.md` の文書更新方針を適用し、変更内容・検証結果・未確認項目を報告する。
