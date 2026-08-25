# Current Firestore Rules and seed

snapshot metadataは`../firestore.md`、Rulesの正本は`firebase/firestore.rules`です。

## Security Rules

| Match                                            | Read                 | Write                                               |
| ------------------------------------------------ | -------------------- | --------------------------------------------------- |
| `users/{userId}`                                 | owner                | owner                                               |
| `users/{userId}/diaries/{diaryId}`               | owner                | owner                                               |
| `users/{userId}/favorites/{favoriteId}`          | owner                | owner                                               |
| `users/{userId}/settings/appearance`             | owner                | owner                                               |
| `users/{userId}/settings/profile`                | owner                | owner                                               |
| `users/{userId}/settings/memory/{memoryPath=**}` | owner                | owner                                               |
| `users/{userId}/legalAcceptances/{version}`      | owner get / list     | owner create、同意完了、account削除時の保持期限追加 |
| `sharedDiaries/{shareId}`                        | unconditional public | create: auth UID、update/delete: existing UID       |

- public readはsingle getだけでなくlist / queryも許可します。
- private pathはpath owner UIDを確認します。
- diary / favorites / settingsではrequired / allowed fieldとfield typeを検証しません。
- diary / settings payloadの`uid`とpath ownerの一致は検証しません。
- shared updateは既存`resource.data.uid`を確認しますが、新しい`request.resource.data.uid`の不変性を検証しません。
- その他のpathは明示的allowがなくdenyされます。
- legal acceptanceは未同意から有効な同意済みpayloadへの更新と、同意済み記録への削除日時・5年後の保持期限の一度限りの追加を許可します。既存fieldの改変、保持期限の延長、deleteはdenyします。

## Indexes and Firestore features

- `firebase/firestore.indexes.json`は`legalAcceptances.retentionExpiresAt`のTTLとsingle-field index除外を定義します。期限到達後のTTL deleteは通常24時間以内です。
- `withConverter`はありません。
- snapshotは`data() as T`でcastします。
- transactionはfavoriteの初回登録に使います。realtime listener、明示的なoffline persistenceはありません。
- `writeBatch`はmemory mergeとshared display name同期に使います。

## Emulator seed coverage

作成するdata:

- `settings/appearance`、`diaries`
- memoryの`profileFacts`、`preferences`、`people`

作成しないdata:

- `settings/profile`、`sharedDiaries`
- `favorites`
- `legalAcceptances`
- Storage image metadata / object

seed前に対象userの`users/{uid}`以下をrecursive deleteしますが、top-level `sharedDiaries`は削除しません。shapeはzodで検証し、write後にAuthとcollection件数を確認します。

`pnpm test:rules`は起動済みFirestore / Storage Emulatorを使い、account削除に必要なowner / non-owner / unauthenticated、legal acceptance保持field、Storage list / deleteを検証します。
