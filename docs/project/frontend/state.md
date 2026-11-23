# Current frontend state

Provider構成は [Frontendの入口](../frontend.md#起動とprovider) を参照してください。

## State owners

| Mechanism                                                      | Current scope                                                                                                    |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| React local state                                              | Dialog、form補助、loading、carousel selection                                                                    |
| [LocalUserContext](../../../src/contexts/LocalUserContext.tsx) | uid、displayName、photoURL、theme、primaryColor、Markdown editor表示設定                                         |
| global Zustand                                                 | [初期日付](../../../src/stores/initialDateStore.ts)、[検索Dialogの開閉](../../../src/stores/diarySearchStore.ts) |
| Context + `zustand/vanilla`                                    | home current date、createDiary / diariesの選択日などpage-scoped state                                            |
| TanStack Query                                                 | 日記、共有日記、お気に入りのFirestore取得データのcacheとページング                                               |
| react-hook-form                                                | profile、memory、diary edit form                                                                                 |

日記の取得データはメモリ内にキャッシュします。[Queryの既定値](../../../src/lib/query/queryClient.ts) は `staleTime: Infinity`、GCまで30分、mount / focus / reconnect時の自動再検証なしです。[共有URL検索](../../../src/features/searchDiary/hooks/useSharedDiarySearch.ts) はmount時に再取得します。日記の作成・編集・削除、共有操作、お気に入り操作の成功後は [関連するquery key](../../../src/lib/query/queryKeys.ts) を無効化します。[QueryCacheSessionBoundary](../../../src/components/shared/query/QueryCacheSessionBoundary.tsx) は認証UIDの変更時にcache全体を消去します。

[検索Dialog](../../../src/features/searchDiary/components/DiarySearchDialog.tsx) は取得した日記からタイトル・タグ・本文を正規化した索引を作り、開いている間に検索語から結果を計算します。検索語だけが変わった場合は索引を再利用します。

テーマ・配色の設定値は`LocalUserContext`が所有し、変更は共有状態に即時反映します。保存失敗では該当設定を戻し通知します。DOMへの適用はroot配下の`UserAppearance`だけが担当します。

共通ショートカットは`AppSidebar`が登録し、定義は`src/lib/shortcuts.ts`で共有します。設定Dialogの開閉・初期tab・復帰focusも`AppSidebar`が所有し、モバイルSidebarの開閉にかかわらずmountします。保存・検索結果・カレンダーの操作は各featureが所有します。

## Browser draft persistence

- client: `src/lib/service/diaryDraftClient.ts`
- metadata: localStorage `memoir-ai:draft:v1:{uid}:{date}`
- image `File`: IndexedDB `memoir-ai-drafts` / `draft-images`
- browser localだけに保存し、Firebaseへ同期しません。

## Guest diary (2026-10-03)

`/guest/new-diary`は `useGuestDiary` のlocal stateで1件の日付・本文・タグを管理します。手動画像と複数セクションは許可しません。500ms後の下書き保存と作成結果は `GuestDiaryClient` が専用IndexedDB `memoir-ai-guest-diary` の `diary/current` へ保存します。本文・metadata・生成画像Blobは同一transactionでcommitし、復元時にzodで検証します。端末保存だけ失敗した場合は生成結果をmemoryに保持して同じ結果の保存を再試行します。

作成と引き継ぎはWeb Locksの `memoir-ai:guest-diary` で複数タブ間を排他制御します。Web Locks非対応ではゲストの作成・保存を開始せず、最新browserを案内します。作成済み結果がある間は別タブの下書きで上書きしません。

`AppShellLayout`は認証・必須同意・user初期化後に `useGuestDiaryImport` を実行します。初回登録先UIDを端末内に固定し、別UIDへの自動登録を拒否します。固定の日記ID・生成画像IDとFirestore transactionで再試行時の重複を防ぎ、登録済み日記があれば画像uploadを省略します。登録後に端末データを削除し、queryを無効化して日別画面へ移動します。失敗時は端末データを保持してretry/logoutを表示します。下書きだけではクラウド登録しません。
