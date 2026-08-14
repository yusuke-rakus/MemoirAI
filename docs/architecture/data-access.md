# Data-access architecture

この文書は外部サービスとbrowser persistenceへ接続する目標境界を定義します。現在のclient、query、失敗挙動は`../project/`を正本とします。

## Gateway boundaries

| Purpose                    | Boundary                             |
| -------------------------- | ------------------------------------ |
| Firestore document / query | domainまたはresource別service client |
| Cloud Storage object       | Storage service client               |
| Authentication             | auth専用hook / service               |
| Firebase AI                | model設定とfeature向けAI gateway     |
| localStorage / IndexedDB   | browser persistence専用gateway       |

- UI componentはSDKやbrowser storage APIを直接呼びません。
- 初期化、Emulator接続、model設定をfeatureへ複製しません。
- gatewayはdomain入力とtyped resultを使い、SDK固有型の露出を最小化します。
- browser persistence contractは境界側で定義し、feature型へ逆依存しません。
- 一つのgatewayは一つの外部境界または密接なresource群に集中します。
- 外部詳細を上位UIへ散らさず、小さくcomposableでtest時に差し替え可能にします。

## Orchestration and failures

- feature hook / use-caseが複数gatewayの順序、成功条件、再試行、補償処理を担当します。
- toast、navigation、Dialog state、再取得はgatewayへ持ち込みません。
- Firestore外のresourceを跨ぐ処理をatomicと仮定しません。
- 同一Firestore境界で整合性が必要な場合だけbatch / transactionを使用します。
- write APIは再実行と重複作成の扱いを定め、部分成功をcallerへ伝えます。
- gatewayのerrorは原因やcodeを保ち、UIが必要な粒度で判別可能にします。
- 予期した失敗と予期しない失敗を区別し、通知と診断情報を保持します。

## Validation and ownership

- URL、form、Firestore、AI output、browser persistenceの値は信頼境界でruntime validationします。
- TypeScript assertionやJSON parse成功をvalidationとして扱いません。
- private resourceは認証UIDとowner UIDを照合し、Security Rulesを最終防御境界にします。
- 未認証readは明示したpublic resourceだけに許可します。
- public copyには公開field、再公開、同期、削除、unpublishの契約を定めます。

## Current implementation

- client配置とbrowser draft: `../project/repository-map.md`
- Auth、Storage、AI、Emulator: `../project/firebase.md`
- Firestore schema、query、Rules: `../project/firestore.md`
- 現在の依存違反: `../project/frontend.md`
