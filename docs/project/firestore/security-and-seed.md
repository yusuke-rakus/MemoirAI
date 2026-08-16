# Current Firestore Rules and seed

snapshot metadataは`../firestore.md`、Rulesの正本は`firebase/firestore.rules`です。

## Security Rules

| Match                                            | Read                 | Write                                                       |
| ------------------------------------------------ | -------------------- | ----------------------------------------------------------- |
| `users/{userId}`                                 | owner                | owner                                                       |
| `users/{userId}/diaries/{diaryId}`               | owner                | owner                                                       |
| `users/{userId}/favorites/{favoriteId}`          | owner                | create/deleteのみ。owner、ID、field、server timestampを検証 |
| `users/{userId}/settings/appearance`             | owner                | owner                                                       |
| `users/{userId}/settings/profile`                | owner                | owner                                                       |
| `users/{userId}/settings/memory/{memoryPath=**}` | owner                | owner                                                       |
| `sharedDiaries/{shareId}`                        | unconditional public | create: auth UID、update/delete: existing UID               |

- public readはsingle getだけでなくlist / queryも許可します。
- private pathはpath owner UIDを確認します。
- diary / settingsではrequired / allowed fieldとfield typeを検証しません。favorites createは検証します。
- diary / settings payloadの`uid`とpath ownerの一致は検証しません。
- shared updateは既存`resource.data.uid`を確認しますが、新しい`request.resource.data.uid`の不変性を検証しません。
- その他のpathは明示的allowがなくdenyされます。

## Indexes and Firestore features

- index definition fileと`withConverter`はありません。
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
- Storage image metadata / object

seed前に対象userの`users/{uid}`以下をrecursive deleteしますが、top-level `sharedDiaries`は削除しません。shapeはzodで検証し、write後にAuthとcollection件数を確認します。Rules unit testではありません。
