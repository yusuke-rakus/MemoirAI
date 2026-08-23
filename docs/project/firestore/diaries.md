# Current diary documents

path: `users/{uid}/diaries/{diaryId}`、client: `src/lib/service/diaryClient.ts`。snapshot metadataは`../firestore.md`を参照してください。

## Confirmed fields

| Field       | Shape                               | Notes                                     |
| ----------- | ----------------------------------- | ----------------------------------------- |
| `id`        | `string`                            | document IDと同値                         |
| `uid`       | `string`                            | owner UID                                 |
| `shareId`   | `string`、optional                  | 現在有効な共有document ID                 |
| `date`      | `Timestamp` on read                 | `Date`または`Timestamp`を書く             |
| `title`     | `string`                            | AI生成、edit可能                          |
| `content`   | `string`                            | 本文                                      |
| `tags`      | `{ name: string; color: string }[]` | amber/lime/sky/indigo/violet/pink/default |
| `images`    | `DiaryImage[]`、optional            | seedでは省略                              |
| `createdAt` | `Timestamp` on read                 | 作成日時、editで維持                      |
| `updatedAt` | `Timestamp` on read、optional       | 新規作成とeditで更新、legacy dataは未保持 |

`DiaryImage`は`id`、`storagePath`、`downloadURL`、`width`、`height`、`contentType`です。型は`src/types/diary/diary.ts`を正本とします。

現行edit flowは`createdAt`と`shareId`を渡さず値を維持し、`updatedAt`だけを更新します。日記カードはlegacy dataで`updatedAt`がない場合に`createdAt`を最終更新日時として表示します。

## Reads

| Method                 | Query                                             |
| ---------------------- | ------------------------------------------------- |
| `DiaryClient.getByUid` | `uid == requested uid`、searchが全件cache         |
| `getByUidAndDate`      | `date >= startOfDay`、`date < nextDay`            |
| `getByUidAndMonth`     | `date >= firstOfMonth`、`date < firstOfNextMonth` |
| `getByUidPaged`        | `createdAt desc`、11件取得、document cursor       |

日/月queryは`orderBy`なしでfeature hookがsortします。searchは全件取得後にtitle / content / tagを検索し、最大50件を表示します。すべてone-shot `getDocs`です。

## Writes and callers

- add: `setDoc(users/{uid}/diaries/{id}, data)`。
- update: `setDoc(..., { merge: true })`、delete: document `delete`。
- 共有開始 / 停止は`SharedDiaryClient`がtransactionで`shareId`を設定 / 除去し、公開copyと同期します。
- Storageとの順序と失敗挙動は`../firebase/ai-and-operations.md`を参照します。
- callerはcreateDiaryの作成、homeの月取得、diariesの日取得・編集・削除です。
- sidebarがpaging、`DiarySearchDialog`が全件取得を呼びます。
- read caller: `src/features/home/hooks/useDiaryList.ts`、`src/features/diaries/hooks/useFetchDiary.ts`、`src/features/sidebar/hooks/useFetchDiary.ts`、`src/features/searchDiary/components/DiarySearchDialog.tsx`。
- write caller: `src/features/createDiary/hooks/useCreateDiary.ts`、diariesの`useDiaryPreviewActions.ts`。
