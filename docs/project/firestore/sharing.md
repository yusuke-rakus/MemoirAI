# Current shared diary documents

path: `sharedDiaries/{shareId}`、client: `src/lib/service/sharedDiaryClient.ts`。snapshot metadataは`../firestore.md`を参照してください。

元のDiary全fieldに次を加えたcopyです。

| Field         | Shape               | Notes                               |
| ------------- | ------------------- | ----------------------------------- |
| `displayName` | `string`            | type上optional、legacy fallbackあり |
| `sharedAt`    | `Timestamp` on read | publish時は`Date`                   |

- `shareId`はsource `diary.id`と同じです。
- publishは`setDoc`で同じIDを上書きします。
- public pageはID指定`getDoc`で読みます。
- profile更新は`where("uid", "==", uid)`で取得し、499件ずつbatch updateします。

## Synchronization boundary

同期するもの:

- publish時のDiary snapshot
- profile更新後の`displayName`

同期しないもの:

- source diaryの後続edit / delete
- source image delete後のshared document cleanup
- 明示的unpublish

shared documentはsource diaryと継続同期されるviewではありません。
