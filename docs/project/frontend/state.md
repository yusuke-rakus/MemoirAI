# Current frontend state

snapshot metadataは`../frontend.md`を参照してください。

## State owners

| Mechanism                   | Current scope                                                         |
| --------------------------- | --------------------------------------------------------------------- |
| React local state           | Dialog、form補助、loading、carousel selection                         |
| `LocalUserContext`          | uid、displayName、photoURL、theme、primaryColor                       |
| global Zustand              | initial date、diary refresh revision、search Dialog / cache           |
| Context + `zustand/vanilla` | home current date、createDiary / diaries / sidebarのpage-scoped state |
| react-hook-form             | profile、memory、diary edit form                                      |

TanStack Queryなどのserver-state libraryはありません。取得hookは主に`useEffect`とlocalまたはProvider-scoped stateへ結果を格納します。

`diaryRefreshStore`を購読するのはsidebarです。create / edit / deleteはrevisionを更新しますが、home月表示と日別画面に共通の自動再取得機構はありません。日別画面はmutation callerが再取得します。

## Browser draft persistence

- client: `src/lib/service/diaryDraftClient.ts`
- metadata: localStorage `memoir-ai:draft:v1:{uid}:{date}`
- image `File`: IndexedDB `memoir-ai-drafts` / `draft-images`
- browser localだけに保存し、Firebaseへ同期しません。
- `DiaryDraftClient`はcreateDiary featureの型へ逆依存しています。
