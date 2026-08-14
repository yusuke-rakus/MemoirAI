# Current diary documents

path: `users/{uid}/diaries/{diaryId}`、client: `src/lib/service/diaryClient.ts`。snapshot metadataは`../firestore.md`を参照してください。

## Confirmed fields

| Field       | Shape                               | Notes                                     |
| ----------- | ----------------------------------- | ----------------------------------------- |
| `id`        | `string`                            | document IDと同値                         |
| `uid`       | `string`                            | owner UID                                 |
| `date`      | `Timestamp` on read                 | `Date`または`Timestamp`を書く             |
| `title`     | `string`                            | AI生成、edit可能                          |
| `content`   | `string`                            | 本文                                      |
| `tags`      | `{ name: string; color: string }[]` | amber/lime/sky/indigo/violet/pink/default |
| `images`    | `DiaryImage[]`、optional            | seedでは省略                              |
| `createdAt` | `Timestamp` on read                 | editで維持、`updatedAt`なし               |

`DiaryImage`は`id`、`storagePath`、`downloadURL`、`width`、`height`、`contentType`です。型は`src/types/diary/diary.ts`を正本とします。

現行edit flowは`createdAt`を渡さないため値を維持しますが、clientは渡された場合にmergeできます。

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
- Storageとの順序と失敗挙動は`../firebase/ai-and-operations.md`を参照します。
- callerはcreateDiaryの作成、homeの月取得、diariesの日取得・編集・削除です。
- sidebarがpaging、`DiarySearchDialog`が全件取得を呼びます。
- read caller: `src/features/home/hooks/useDiaryList.ts`、`src/features/diaries/hooks/useFetchDiary.ts`、`src/features/sidebar/hooks/useFetchDiary.ts`、`src/features/searchDiary/components/DiarySearchDialog.tsx`。
- write caller: `src/features/createDiary/hooks/useCreateDiary.ts`、diariesの`useDiaryPreviewActions.ts`。
