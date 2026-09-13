# Current frontend state

snapshot metadataは`../frontend.md`を参照してください。

## State owners

| Mechanism                   | Current scope                                                          |
| --------------------------- | ---------------------------------------------------------------------- |
| React local state           | Dialog、form補助、loading、carousel selection                          |
| `LocalUserContext`          | uid、displayName、photoURL、theme、primaryColor                        |
| global Zustand              | initial date、diary / favorite refresh revision、search Dialog / cache |
| Context + `zustand/vanilla` | home current date、createDiary / diariesの選択日などpage-scoped state  |
| TanStack Query              | 日記、共有日記、お気に入りのFirestore取得cacheとページング             |
| react-hook-form             | profile、memory、diary edit form                                       |

日記ドメインの取得hookはTanStack Queryを使用します。cacheはメモリ内だけで、`staleTime: Infinity`、30分のGC、mount / focus / reconnectでの自動再検証なしです。日記の作成・編集・削除、共有操作、お気に入り操作の成功後に、該当UIDのquery keyを無効化して再取得します。認証UIDが変わるとQuery cache全体を消去します。

検索DialogのZustand storeは開閉状態だけを保持します。日記検索結果、sidebarの日記・お気に入り一覧、日別画面の日記配列はQuery cacheが所有し、refresh revision storeは使用しません。

## Browser draft persistence

- client: `src/lib/service/diaryDraftClient.ts`
- metadata: localStorage `memoir-ai:draft:v1:{uid}:{date}`
- image `File`: IndexedDB `memoir-ai-drafts` / `draft-images`
- browser localだけに保存し、Firebaseへ同期しません。
