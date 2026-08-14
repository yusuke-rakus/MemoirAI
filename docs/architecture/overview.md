# Architecture overview

この文書はMemoirAIの目標構造と依存方向を定義します。現在の実装と逸脱は`../project/`を正本とします。

## System boundary

MemoirAIはFirebase Hostingから配信するBrowser SPAです。画面状態とユーザー操作はSPAが所有し、用途別gatewayを介してFirebaseとbrowser persistenceへ接続します。

- Hostingは静的成果物の配信境界で、domain logicやdata ownershipを担当しません。
- browser-local dataはFirebase dataと同じ同期・可用性を保証しません。
- 外部サービスの具体的な利用状況は`../project/firebase.md`を参照します。

## Dependency direction

```text
app composition → feature → shared / core
                          ↘ purpose-specific gateway → external service
```

- app compositionはrouter、layout、app-wide Provider、feature entryを構成します。
- featureは一つのユーザー目的を所有し、別featureへ依存しません。
- shared / coreはfeature固有の型や状態へ逆依存しません。
- gatewayは外部APIの差異を閉じ込め、UIへ依存しません。

現在この方向に反する実装は、許容例外ではなく移行対象として`../project/frontend.md`に記録します。

## Data and privacy boundaries

- private dataは認証UIDとowner UIDを照合し、UIだけで保護しません。
- 未認証公開は明示的なpublic resourceに限定し、private resourceを直接公開しません。
- public copyには公開field、同期、削除、legacy dataの契約を定めます。
- browser-local dataはuser・日付などのnamespaceと消去・複数tab時の挙動を明示します。

## Detailed architecture

- frontendの責務・state・routing: `frontend.md`
- gateway・validation・複数resource操作: `data-access.md`
