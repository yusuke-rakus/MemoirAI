# Current UI patterns

固定ルールは`../../rules/ui.md`、snapshot metadataは`../frontend.md`を参照してください。

## Theme and layout

- 通常色は`bg-background`、`text-foreground`、`text-muted-foreground`、`border-border`、`bg-primary`、`text-destructive`などを使います。アクセントカラーはデフォルト、ブルー、グリーン、イエロー、レッド、パープル、ピンクから選べ、`primary`、`sidebar-primary`、`ring` tokenへ反映します。お気に入りのactive iconは`text-favorite` / `fill-favorite`を使います。
- 日記本文は`react-markdown`と`remark-gfm`で安全に描画します。詳細・共有では見出し、強調、list、引用、code、tableなどを組版し、月一覧・検索結果ではMarkdown記法を除いたplain text相当の抜粋を表示します。HTMLとMarkdown画像は描画せず、通常textの単一改行は維持します。
- route contentの外枠は`MainLayout`の中央寄せ・最大幅・横paddingです。
- responsiveは既存の`sm` / `md` breakpointと`useIsMobile`を参照します。
- 認証済み画面は`md`未満で48px高のモバイルヘッダーを表示し、`md`以上はサイドバーへ操作を集約する。サイドバー閉鎖時は左上の小型操作群とコンテンツ用の左余白を表示する。
- diary preview / 共有表示はCard、`DiaryImageGrid`、本文、tagを再利用しますが、app共通card layoutではありません。
- sidebarのお気に入り欄はshadcn / Radix `Collapsible`で初期閉鎖し、展開時に登録日の新しい順で10件ずつ表示します。favoriteと自分の日記は同じ一覧scroll領域を使います。
- spacing tokenと正式なtypography scaleは確立していません。
- Login背景は一般UIとは別のbranding表現です。
- LoginはGoogleログインを明記し、記録・AI整理・任意共有の3段階と利用条件の折りたたみ要約を表示します。legal画面の要約は全文を置き換えず、文書version・同意境界は維持します。
- キーボードfocusは`focus-visible`で表示し、reduced-motion時は装飾animationとsmooth scrollを抑止します。

## Interaction patterns

- 2-action Dialog: footerは`flex-row gap-2 sm:gap-0`、buttonは`flex-1 sm:flex-none`。
- Dialogは`DialogContent`、`DialogHeader`、`DialogTitle`、必要に応じて`DialogDescription` / `DialogFooter`を組み合わせます。
- cancelは`outline`、削除・破棄は`destructive`です。
- 日付選択は`DiaryEditDialog`の`Popover modal`構成です。
- 日記の作成・編集は、一般設定でMarkdownエディタを有効にした場合のみshadcn / Radix `Tabs`で本文の入力とMarkdownプレビューを切り替えます。既定では本文入力欄のみを表示します。
- DropdownからDialogを開く既存例は、menuを閉じて次frameでDialogを開きます。
- 初期認証・同意確認は`LoadingScreen`、shell内のpage / section loadingは`ContentSkeleton`、一覧・設定はSkeleton、compact操作はSpinnerまたは処理中labelです。日記取得失敗は空表示と分けて再試行を案内します。
- 作成フォームは本文の近くにエラーを表示し、`aria-invalid` / `aria-describedby`とエラー欄へのfocusを提供します。Markdownプレビュー中でもエラー時は入力に戻します。
- 月一覧の空状態では対象年月を明記します。Sidebarの自分の日記は「最近の日記」として個別カードのhashへリンクします。
- 日記の「共有と公開範囲」Dialogは公開対象・コピーの更新・停止時の制約を説明し、確認チェック後に公開できます。共有中の表示と公開日、プレビュー、停止確認を提供します。設定側のリンクコピーは公開コピーを更新しません。
- Settings Dialogはデスクトップでプロフィール、一般、ショートカット、メモリ、共有した日記、アカウントの6 tabを表示します。スマホ幅ではショートカットtabを表示しません。共有した日記では公開中の共有コピーを一覧・解除し、0件時は`Empty`を表示します。アカウント削除はnested Dialogで説明・Google再認証を行い、処理中は外側を含めてcloseを抑止します。
- ショートカットtabはOS別キー表記と画面別の利用条件を表示します。IME変換中・長押しは無視し、最前面のDialog／menuを優先します。共通操作は新規作成（Mod+Shift+O）、検索（Mod+K）、Sidebar（Mod+B）、デスクトップの解説（?）。作成・編集のMod+Enterは既存保存処理を呼びます。
- 検索はcombobox/listboxで上下選択・Enterによる遷移を提供し、検索語反映待ちは遷移を抑止します。Escでは閉じません。カレンダーは矢印で日付focusを移し、Enter/Spaceで選択を確定、Tで今日へ移動します。

## Reference implementations

- Dialog / Form: `src/features/diaries/components/DiaryDeleteDialog.tsx`、`src/features/diaries/components/DiaryEditDialog.tsx`
- Loading / Empty: `src/components/shared/common/LoadingScreen.tsx`、`src/features/diaries/components/EmptyDiaries.tsx`
- Diary UI: `src/features/diaries/components/DiaryPreviewCard.tsx`、`src/features/home/diaryList/components/DiaryItem.tsx`、`src/features/sharedDiary/components/SharedDiaryView.tsx`
- Images: `src/features/diaries/components/DiaryImageGrid.tsx`
- Responsive nested Dialog: `src/components/shared/header/SettingsDialog.tsx`
- Theme-aware calendar: `src/features/home/calendar/calendar.css`

共通error-state component、全form共通のstate方式、UI copy / ellipsis規則は確立していません。
