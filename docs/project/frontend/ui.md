# Current UI patterns

固定ルールは`../../rules/ui.md`、snapshot metadataは`../frontend.md`を参照してください。

## Theme and layout

- 通常色は`bg-background`、`text-foreground`、`text-muted-foreground`、`border-border`、`bg-primary`、`text-destructive`などを使います。お気に入りのactive iconは`text-favorite` / `fill-favorite`を使います。
- 日記本文は`whitespace-pre-wrap text-foreground/80`をpreviewと共有表示で使います。
- route contentの外枠は`MainLayout`の中央寄せ・最大幅・横paddingです。
- responsiveは既存の`sm` / `md` breakpointと`useIsMobile`を参照します。
- 認証済み画面は`md`未満で48px高のモバイルヘッダーを表示し、`md`以上はサイドバーへ操作を集約する。サイドバー閉鎖時は左上の小型操作群とコンテンツ用の左余白を表示する。
- diary preview / 共有表示はCard、`DiaryImageGrid`、本文、tagを再利用しますが、app共通card layoutではありません。
- spacing tokenと正式なtypography scaleは確立していません。
- Login背景は一般UIとは別のbranding表現です。

## Interaction patterns

- 2-action Dialog: footerは`flex-row gap-2 sm:gap-0`、buttonは`flex-1 sm:flex-none`。
- Dialogは`DialogContent`、`DialogHeader`、`DialogTitle`、必要に応じて`DialogDescription` / `DialogFooter`を組み合わせます。
- cancelは`outline`、削除・破棄は`destructive`です。
- 日付選択は`DiaryEditDialog`の`Popover modal`構成です。
- DropdownからDialogを開く既存例は、menuを閉じて次frameでDialogを開きます。
- page / section loadingは`LoadingScreen`、一覧・設定はSkeleton、compact操作はSpinnerまたは処理中labelです。

## Reference implementations

- Dialog / Form: `src/features/diaries/components/DiaryDeleteDialog.tsx`、`src/features/diaries/components/DiaryEditDialog.tsx`
- Loading / Empty: `src/components/shared/common/LoadingScreen.tsx`、`src/features/diaries/components/EmptyDiaries.tsx`
- Diary UI: `src/features/diaries/components/DiaryPreviewCard.tsx`、`src/features/home/diaryList/components/DiaryItem.tsx`、`src/features/sharedDiary/components/SharedDiaryView.tsx`
- Images: `src/features/diaries/components/DiaryImageGrid.tsx`
- Responsive nested Dialog: `src/components/shared/header/SettingsDialog.tsx`
- Theme-aware calendar: `src/features/home/calendar/calendar.css`

共通error-state component、全form共通のstate方式、UI copy / ellipsis規則は確立していません。
