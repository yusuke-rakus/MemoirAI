# Legal acceptance records

snapshot metadataは`../firestore.md`を参照してください。実装上の正本は`src/lib/service/legalAcceptanceClient.ts`、文書versionの正本は`src/features/legal/documents/*.md`のfront matterです。`src/features/legal/constants/legalDocuments.ts`はfront matterから保存用versionを組み立てます。

## `users/{uid}/legalAcceptances/{requiredConsentVersion}`

Google認証後、現在の必須同意versionに対して利用者が同意した証跡を保存します。document IDを直接取得し、同意済みユーザーへ通常ログイン時に同意画面を再表示しません。

現在の必須同意versionは、初回リリース用の`v1`です。

| Field                    | Shape                                              |
| ------------------------ | -------------------------------------------------- |
| `uid`                    | owner UID                                          |
| `requiredConsentVersion` | document IDと同じstring                            |
| `documentVersions`       | `terms`、`privacy`、`aiDataUse`の完全な文書version |
| `confirmedAdult`         | 同意済みの記録では`true`                           |
| `acceptanceMethod`       | `single-checkbox`                                  |
| `locale`                 | `ja-JP`                                            |
| `acceptedAt`             | server timestamp                                   |
| `accountDeletedAt`       | account削除時のserver timestamp、optional          |
| `retentionExpiresAt`     | account削除から5年後のTTL timestamp、optional      |

- 文書versionは`YYYY-MM-DD.<本文hash先頭8文字>`で保存します。表現修正では各`documentVersions`だけを更新し、再同意を要求しません。
- 利用目的、外部送信、AI処理、共有範囲等の重要変更時だけ`requiredConsentVersion`を更新します。
- `confirmedAdult: false`の既存記録は未同意として扱い、同意画面を表示します。
- 証跡はowner get / listとcreateを許可します。既存の未同意記録を救済するため、ownerによる`confirmedAdult: false`から有効な同意済みpayloadへの更新を許可します。
- account削除時に限り、同意済み記録へ`accountDeletedAt`と`retentionExpiresAt`を一度だけ追加できます。既存fieldの変更、保持期限の再設定、1825〜1827日より外の期限、deleteは許可しません。
- `retentionExpiresAt`はcollection group `legalAcceptances`のTTL fieldです。期限到達後の削除は即時ではなく、通常24時間以内に行われます。
- account削除処理は契約同意記録を残し、その他の`users/{uid}`配下を削除してからAuth accountを削除します。Auth削除後はowner tokenを取得できないため通常appから証跡へアクセスできません。
- Emulator seedは同意記録を作成しません。
