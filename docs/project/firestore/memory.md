# Current memory documents

base pathは`users/{uid}/settings/memory/{collectionId}/{documentId}`です。snapshot metadataは`../firestore.md`を参照してください。

clientは`src/lib/service/userMemoryClient.ts`です。

## `profileFacts/{factId}`

| Field        | Shape                                                                         |
| ------------ | ----------------------------------------------------------------------------- |
| `id`         | `string`                                                                      |
| `key`        | `displayName \| ageRange \| gender \| occupation \| location \| familyStatus` |
| `value`      | `string`                                                                      |
| `confidence` | `number`                                                                      |

## `preferences/{factId}`

| Field        | Shape    |
| ------------ | -------- |
| `id`         | `string` |
| `value`      | `string` |
| `confidence` | `number` |

## `people/{personId}`

| Field                | Shape                                             |
| -------------------- | ------------------------------------------------- |
| `id` / `name`        | `string`                                          |
| `aliases`            | `string[]`                                        |
| `relationshipToUser` | `{ value: string; confidence: number }`、optional |
| `attributes`         | `{ value: string; confidence: number }[]`         |
| `relationshipNotes`  | `{ value: string; confidence: number }[]`         |

## Reads and writes

- `UserMemoryClient`が各collectionを全件`getDocs`します。
- SettingsDialogがmanual update / deleteを呼びます。
- diary作成時に3 collectionを並列取得してAI contextへ渡します。
- AI結果を既存fact / personとmergeし、差分を一つのbatchでsetします。
- confidenceは0〜1へclampし、profile keyと空文字も一部filterします。
- Firestore値とAI outputにruntime zod validationはありません。
