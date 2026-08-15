# Current favorite documents

path: `users/{uid}/favorites/{sharedDiaryId}`、client: `src/lib/service/favoriteClient.ts`。snapshot metadataは`../firestore.md`を参照してください。

## Fields and identity

| Field           | Shape    | Notes               |
| --------------- | -------- | ------------------- |
| `sharedDiaryId` | `string` | document IDと同じ値 |

- document IDに共有日記IDを使い、同じユーザーによる重複登録を防ぎます。
- UID、登録日時、共有日記本文は保存しません。
- 共有日記の削除に連動したcleanupはありません。

## Reads and writes

- 共有日記ページは認証済みの場合だけID指定`getDoc`で登録状態を読みます。
- 追加は同じIDへの`setDoc`、解除は`deleteDoc`です。
- Security Rulesはpath ownerだけにread / writeを許可し、write時はfieldとdocument IDの一致を検証します。
- お気に入り一覧と一覧用queryはありません。
