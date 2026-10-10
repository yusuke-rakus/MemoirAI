# 不具合修正の手順

1. 症状、期待する挙動、再現条件、影響範囲を確認する。必要なら対象テストだけで変更前の状態を記録する。
2. render / data pathを入口から追い、state・event・route・service・永続化のどの境界でずれるか特定する。近接実装を比較し、Firebaseではclient・型・Rules・seedを照合する。
3. 推測した原因を先に修正せず、原因の境界を局所的に直す。既存構造に沿い、複数resourceの部分更新・失敗時cleanupも確認する。依頼範囲外の問題は修正と分けて報告する。
4. 元の再現条件と直接影響する正常・反対・失敗caseだけを [検証ルール](../rules/testing.md) に従って確認する。回帰commitの指定があればbefore / afterを区別する。
5. 構造理解が変わる場合だけ `AGENTS.md` の文書更新方針を適用する。実行結果・既存失敗・未確認を区別し、source inspectionをruntime確認と混同しない。
