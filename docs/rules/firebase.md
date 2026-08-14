# Firebase rules

この文書はFirebase変更時の固定・準固定方針です。現在のサービス構成は`../project/firebase.md`、Firestore pathとfieldは`../project/firestore.md`を参照してください。

## Initialization and access boundaries

- Firebase App、Auth、Firestore、Storageの初期化は`src/firebase/firebase.ts`に集約し、別moduleで重複初期化しない。
- FirestoreとStorageはresource / domain別のservice clientを経由する。既存clientの責務に収まる場合は拡張し、異なるresourceなら用途別clientを追加する。
- Authenticationはauth専用hook / serviceを経由し、UI componentからAuth SDKを直接呼ばない。
- Firebase AIのmodel / schemaは`src/firebase/models`へ置き、feature向けgatewayを介して呼び出す。UI componentへmodel設定やSDK呼び出しを埋め込まない。
- localStorage / IndexedDBはbrowser persistence専用gatewayを経由し、UI componentから直接操作しない。
- 現在の直接SDK利用と不足しているgatewayは`../project/frontend.md`へ記録し、新規実装でその逸脱を増やさない。

## Service behavior

- service functionは小さく、入力と戻り値をtypedにする。
- path構築に必要な認証UIDやdocument IDは、既存clientのvalidation有無を確認する。新規APIでは空値を暗黙のfallback pathとして扱わない（Recommended）。
- errorを握りつぶさず、callerが判断できるtyped errorまたはtyped resultとして返す。gateway内でtoastやnavigationを実行しない。
- feature hook / use-caseが複数gatewayの処理順序、rollback、toast、navigation、再取得を接続する。
- uploadとFirestore writeのような複数resource操作では、各段階の失敗後に残るdataと補償処理を定義する。
- URL、Firestore document、AI output、browser persistenceの復元値はruntime validationし、castをvalidationとして扱わない。

## Security and data changes

- user private dataはowner境界を明示し、Security Rulesで認証UIDとowner UIDを照合する。
- 未認証公開は明示したresourceだけに限定し、公開範囲を推測で拡張しない。現在のpathとaccess matrixは`../project/firestore.md`を正本とする。
- collection、document path、必須field、ownership、公開範囲を変える場合は、client、型、Firestore Rules、Storage Rules、seed、`../project/firestore.md`を一緒に確認する。
- Storage path、MIME、size制約を変える場合はclient-side validationとStorage Rulesを同期する。
- 非正規化dataを変更する場合は、作成時だけでなく既存copyの同期・legacy fallback・削除時の扱いを確認する。
- 本番data migrationの方式: `Not established`。migrationが必要なら既存dataの互換性とrollbackを先に設計する。

## Authentication

- 認証必須routeと公開routeの境界を保ち、変更時は`../project/frontend.md`も確認する。
- display nameなどAuthとFirestoreの両方に存在し得る値は、現在の優先順位を確認してから変更する。
- display nameは一意なidentifierではなく重複可能な表示値として扱う。同期先をFirebase AuthやAI memoryへ広げる場合は、明示要件とmigration境界を先に確認する。
- login/logout failureはユーザーへtoastで通知し、local user stateとtheme overrideのcleanupも確認する。

## Emulator and deployment

- local開発・rules確認・seedの依頼を、本番deployの許可と解釈しない。
- `pnpm seed`は起動済みEmulator専用として維持し、本番credentialへfallbackさせない。
- Emulator portが使用中なら、他processを無断停止せず一時config / portで検証する。
- Firestore / Storage Rulesを変更したら、可能な範囲でEmulatorにより対象owner、非owner、未認証のcaseを確認する。
- rules unit testの採用方針: `No explicit convention found`。
- deployはHosting、Rules、Functionsを別scopeとして扱い、workflowの現在状態を`../project/firebase.md`で確認する。
