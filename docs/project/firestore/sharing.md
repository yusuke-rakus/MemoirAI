# Current shared diary documents

path: `sharedDiaries/{shareId}`、client: `src/lib/service/sharedDiaryClient.ts`。snapshot metadataは`../firestore.md`を参照してください。

元のDiary全fieldに次を加えたcopyです。

| Field         | Shape               | Notes                               |
| ------------- | ------------------- | ----------------------------------- |
| `displayName` | `string`            | type上optional、legacy fallbackあり |
| `sharedAt`    | `Timestamp` on read | publish時は`Date`                   |

- 新規`shareId`は`share-{uuid}`で生成し、source diaryのoptional `shareId`へ保存します。公開copyには管理用`shareId`を含めません。
- publishはtransactionでsource diaryを読み、公開copyのsetとsource `shareId`の更新を同時に行います。共有中は同じIDを再利用し、停止後の再共有では新しいIDを発行します。
- `shareId`を持たないlegacy diaryは`sharedDiaries/{diary.id}`の存在を確認し、既存URLを共有中として扱います。明示的な一括migrationはありません。
- unpublishはtransactionで公開copyを削除し、source diaryの`shareId`を除去します。legacy公開copyも同じ操作で削除できます。
- public pageはID指定`getDoc`で読みます。
- profile更新は`where("uid", "==", uid)`で取得し、499件ずつbatch updateします。

## Synchronization boundary

同期するもの:

- publish時のDiary snapshot
- publish / unpublish時のsource diary `shareId`
- profile更新後の`displayName`

同期しないもの:

- source diaryの後続edit
- source image delete後のshared document cleanup

source diary削除時は、先にunpublishを完了してからprivate documentを削除します。unpublish失敗時はprivate documentの削除を中断します。共有者は別userのprivate favoriteを削除せず、favorite ownerがsidebar一覧を取得した際に参照先のない文書を自身の権限でbest-effort削除します。

shared documentはsource diaryと継続同期されるviewではありません。
