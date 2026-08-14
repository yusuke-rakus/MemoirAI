# Current Firebase AI and cross-resource operations

snapshot metadataは`../firebase.md`を参照してください。

## Firebase AI Logic

- browserで`getAI(app, { backend: new GoogleAIBackend() })`を初期化します。
- modelは`gemini-3-flash-preview`です。
- title / tag生成とmemory extractionはJSON response schemaを設定します。
- responseは`JSON.parse`後にTypeScript castされ、runtime zod validationはありません。
- `src/firebase/models/testModel.ts`はmodel定義で、自動testではありません。

## Cross-resource operations

- diary作成はStorage upload後にFirestoreへsetし、失敗時はupload済み画像の削除を試みます。
- 編集は新画像upload → Firestore merge → 旧画像deleteです。Firestore失敗時は新画像をrollbackします。
- 編集成功後の旧画像delete失敗はwarningとなり、孤児objectが残り得ます。
- 削除はStorage → Firestoreの順で、後段失敗時はdocumentが削除済み画像を参照し得ます。
- diary作成後のmemory保存失敗は、作成済みdiaryの成功を取り消しません。
- display nameとshared document更新はFirestore batchです。詳細は`../firestore/sharing.md`を参照します。
- Storage、Firestore、AIを跨ぐtransactionはありません。
