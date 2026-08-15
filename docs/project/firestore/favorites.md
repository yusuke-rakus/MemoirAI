# Current favorite documents

path: `users/{uid}/favorites/{sharedDiaryId}`、client: `src/lib/service/favoriteClient.ts`。snapshot metadataは`../firestore.md`を参照してください。

## Fields and identity

| Field           | Shape       | Notes                                |
| --------------- | ----------- | ------------------------------------ |
| `sharedDiaryId` | `string`    | document IDと同じ値                  |
| `createdAt`     | `Timestamp` | server timestamp、一覧の登録順に使用 |

- document IDに共有日記IDを使い、同じユーザーによる重複登録を防ぎます。
- UID、共有日記本文は保存しません。
- 共有日記の削除に連動したcleanupはありません。
- `createdAt`を持たない既存文書のmigrationはなく、一覧queryの対象外です。

## Reads and writes

- 共有日記ページは認証済みの場合だけID指定`getDoc`で登録状態を読みます。
- 追加はtransactionで文書がない場合だけserver timestamp付きで作成し、解除は`deleteDoc`です。
- sidebar一覧は`createdAt desc`で11件読み、10件とcursor、次pageの有無を返します。参照先の共有日記は最大10 IDの`in` queryで取得します。
- Security Rulesはpath ownerだけにread / create / deleteを許可します。create時はfield、document ID、server timestampを検証し、updateは許可しません。
