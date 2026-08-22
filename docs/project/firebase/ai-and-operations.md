# Current Firebase AI and cross-resource operations

snapshot metadataは`../firebase.md`を参照してください。

## Firebase AI Logic

- browserで`getAI(app, { backend: new GoogleAIBackend() })`を初期化します。
- title / tagとmemory extractionの既定modelは`gemini-3-flash-preview`です。
- title / tag生成とmemory extractionはJSON response schemaを設定します。
- responseは`JSON.parse`後にTypeScript castされ、runtime zod validationはありません。
- `src/firebase/models/testModel.ts`はmodel定義で、自動testではありません。

### Diary illustration

- 新規日記の`絵日記で保存`だけが画像modelを呼びます。通常保存、編集、共有表示では呼びません。
- 対象は本文がある各sectionで、modelへ渡すdataはそのsectionの本文、tag名、保存済みのactive long-term memoryです。手動画像と今回の日記から新たに抽出するmemoryは渡しません。
- active memoryは保存操作ごとに1回取得して全sectionで共有します。取得失敗時は`memoryContext: null`として本文とtagだけで生成を続けます。
- model system instructionは入力中の命令を無視し、本文を出来事の一次情報として具体的な1場面を温かい手描き水彩で描きます。プロフィール、嗜好、人物関係は配色、雰囲気、服装、背景、モチーフへ広く反映しますが、本文と矛盾する内容やmemoryだけに存在する人物・出来事は追加しません。画像内文字、caption、写実的な個人再現を避け、4:3固定です。
- `VITE_DIARY_IMAGE_MODEL`の許可値は`gemini-3.1-flash-lite-image`、`gemini-3.1-flash-image`、`gemini-3-pro-image`です。
- `VITE_DIARY_IMAGE_SIZE`の対応はLiteが`512|1K`、Flashが`512|1K|2K|4K`、Proが`1K|2K|4K`です。既定値はLite / `1K`です。
- `DiaryIllustrationClient`が最初のinline imageを取り出し、Base64、MIME（PNG / JPEG / WebP）、空dataを検証して`File`へ変換します。画像なし、安全filter拒否、不正data、model呼び出し失敗は判別可能なerrorです。
- 本文があるsectionに手動画像が2枚ある場合、生成開始前に全体を止めます。0〜1枚の場合は生成画像を先頭に追加し、既存の`DiaryImageClient`で保存します。

## Cross-resource operations

- diary作成は全sectionの必須titleと、絵日記時の全画像生成が成功した後にStorage uploadを開始します。生成失敗時はStorage / Firestore write、draft削除、画面遷移を行いません。
- diary作成はStorage upload後にFirestoreへsetし、失敗時はupload済み画像の削除を試みます。AI生成画像も同じrollback対象です。
- 編集は新画像upload → Firestore merge → 旧画像deleteです。Firestore失敗時は新画像をrollbackします。
- 編集成功後の旧画像delete失敗はwarningとなり、孤児objectが残り得ます。
- 削除はStorage → Firestoreの順で、後段失敗時はdocumentが削除済み画像を参照し得ます。
- diary作成後のmemory保存失敗は、作成済みdiaryの成功を取り消しません。
- display nameとshared document更新はFirestore batchです。詳細は`../firestore/sharing.md`を参照します。
- Storage、Firestore、AIを跨ぐtransactionはありません。

## App Check and protection mode

- Firebase App初期化直後、他service取得前にreCAPTCHA Enterprise App Checkを初期化し、token自動更新を有効にします。
- developmentは`FIREBASE_APPCHECK_DEBUG_TOKEN = true`を初期化前に設定します。browser consoleへ表示されたdebug tokenをFirebase Consoleへ手動登録し、token自体はrepositoryへ保存しません。
- testはbrowser attestationを実行しません。
- Firebase ConsoleのFirebase AI LogicではBaseline protectionをenforceします。Replay protectionとauthenticated-users modeはこのsnapshotでは使用しません。
