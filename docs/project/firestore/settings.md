# Current user settings

snapshot metadataは`../firestore.md`を参照してください。

実装は [UserSettingsClient](../../../src/lib/service/userSettingsClient.ts) と [UserProfileClient](../../../src/lib/service/userProfileClient.ts) を参照してください。

## `users/{uid}/settings/appearance`

| Field                   | Shape                                                 |
| ----------------------- | ----------------------------------------------------- |
| `uid`                   | `string`                                              |
| `theme`                 | `light \| dark \| system`                             |
| `primaryColor`          | `default \| blue \| green \| yellow \| red \| purple` |
| `markdownEditorEnabled` | `boolean`                                             |
| `createdAt`             | date / timestamp                                      |
| `updatedAt`             | date / timestamp                                      |

`UserSettingsClient`はgeneric `Record<string, unknown>`をmergeし、`uid`を常に追加します。Rulesにfield / type制限はなく、存在しないdocumentへの部分updateで一部fieldだけのdocumentを作成できます。

[認証状態の復元](../../../src/hooks/useAuthCheck.ts) でtheme、primary color、Markdown editorの表示設定を読みます。[同意確認後の初期化](../firebase/auth.md#login-and-restoration) で欠損項目を補い、`markdownEditorEnabled` の既定値は `false` です。設定変更時は `useTheme`、`usePrimaryColor`、`useMarkdownEditorSetting` が書き込みます。

## `users/{uid}/settings/profile`

| Field         | Shape            | Notes                                        |
| ------------- | ---------------- | -------------------------------------------- |
| `uid`         | `string`         | owner UID                                    |
| `displayName` | `string`         | 空値は`ユーザー`へnormalize、手動は1〜50文字 |
| `createdAt`   | date / timestamp | initializeまたは初回update                   |
| `updatedAt`   | date / timestamp | initialize / update                          |

- 認証状態の復元時に読み、[プロフィールフォーム](../../../src/components/shared/header/ProfileSettingsForm.tsx) は `LocalUserContext` の表示名を使用します。
- 同意確認後の初期化で、profileがなければFirebase Authの表示名を元に作成します。
- プロフィールフォームから表示名を変更すると、Firestoreのprofileと同じUIDの共有日記を更新します。Firebase Authの `displayName` は更新対象外です。
