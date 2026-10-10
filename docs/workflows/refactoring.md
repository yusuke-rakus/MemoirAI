# リファクタリングの手順

外部の挙動を維持する構造変更として扱います。挙動変更やmigrationは別途scopeを明示します。

1. public props / method、route、表示・操作、Firestore / Storage契約、成功・error・loadingの不変条件を定め、consumer・importを調べる。必要な対象検証だけでbaselineを記録する。
2. ファイル分割はLOCだけで決めず、独立した変更理由、層・外部境界、stateのownerと生存期間、consumer・co-changeを根拠にする。「明確な候補」「凝集しているもの」「分割不要」に分け、未確認の意図は推測しない。
3. 候補にはRecommendedの分割境界・配置・最小interface・互換性を保つ移行順・検証を定める。共通化は見た目だけでなく責務・生存期間・data契約と現在の複数consumerを確認する。
4. file移動・API変更・挙動変更・整形を別の論理単位にする。component、feature hook / use-case、純粋ロジック、gatewayのownerを明確にし、不要な層を名前だけ追加しない。
5. 互換な境界を先に作りconsumerを段階的に移す。型確認可能な状態を保ち、循環importやfeature間依存を増やさない。path・field・Rules不変ならdata migrationを発生させない。範囲外の重複を無理に統合しない。
6. [検証ルール](../rules/testing.md) に従い、変更した契約と影響するconsumerの不変条件だけを確認する。性能改善は測定方法とbefore / afterを示す。
7. 文書は `AGENTS.md` の更新方針に従う。実装を既存architectureへ近づけるだけなら目標設計を書き換えない。
