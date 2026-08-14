# Current user settings

snapshot metadataは`../firestore.md`を参照してください。

clientsは`src/lib/service/userSettingsClient.ts`と`src/lib/service/userProfileClient.ts`です。

## `users/{uid}/settings/appearance`

| Field          | Shape                                                 |
| -------------- | ----------------------------------------------------- |
| `uid`          | `string`                                              |
| `theme`        | `light \| dark \| system`                             |
| `primaryColor` | `default \| blue \| green \| yellow \| red \| purple` |
| `createdAt`    | date / timestamp                                      |
| `updatedAt`    | date / timestamp                                      |

`UserSettingsClient`はgeneric `Record<string, unknown>`をmergeし、`uid`を常に追加します。Rulesにfield / type制限はなく、存在しないdocumentへの部分updateで一部fieldだけのdocumentを作成できます。

auth state復元でtheme / primary colorを読み、new-user migrationが欠損fieldをdefaultで補います。migration、`useTheme`、`usePrimaryColor`がwriteします。

## `users/{uid}/settings/profile`

| Field         | Shape            | Notes                                        |
| ------------- | ---------------- | -------------------------------------------- |
| `uid`         | `string`         | owner UID                                    |
| `displayName` | `string`         | 空値は`ユーザー`へnormalize、手動は1〜50文字 |
| `createdAt`   | date / timestamp | initializeまたは初回update                   |
| `updatedAt`   | date / timestamp | initialize / update                          |

- auth復元、login welcome、profile formでreadします。
- new-user loginとProfileSettingsFormがwriteします。
- display name更新は同じUIDのshared copiesも更新します。
- Firebase Authの`displayName`は更新しません。
