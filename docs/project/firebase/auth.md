# Current Firebase Authentication

route境界は [routing](../frontend/routing.md)、保存項目は [Firestoreのユーザー設定](../firestore/settings.md) を参照してください。

## Login and restoration

- [Firebase初期化](../../../src/firebase/firebase.ts) で `GoogleAuthProvider` を設定します。追加scopeやpersistence設定、Email / Passwordやanonymous authの利用はありません。
- [共有ログインhook](../../../src/hooks/useGoogleLogin.ts) が `signInWithPopup`、重複実行防止、成功・失敗通知を担当します。成功時はFirebase Authの `user.displayName` がある場合に歓迎メッセージを表示し、popup認証失敗時は「Googleでのログインに失敗しました」と通知します。
- [認証状態の監視](../../../src/hooks/useAuthCheck.ts) は `onAuthStateChanged` でappearanceとprofileを読み、画面表示用の名前をFirestore `settings/profile.displayName` → Firebase Auth `displayName` → `null` の順で解決します。最新の読み込みに失敗した場合は直前のユーザー状態を保持し、loadingを解除します。
- [AppShellLayout](../../../src/layout/AppShellLayout.tsx) は必須同意を確認すると、既存ユーザーも含めて [初期化hook](../../../src/hooks/useUserInitialization.ts) を実行します。appearanceの不足を補い、profileがなければ作成します。初期化に失敗した場合は利用準備エラーを表示し、再試行・ログアウトを案内します。
- [ログイン画面](../../../src/features/login/hooks/useLogin.ts) は認証成功時に `/` へ移動します。[ゲスト日記](../../../src/features/createDiary/GuestDiaryPage.tsx) も共有hookで認証を始め、同意・初期化を経て [端末の日記の引き継ぎ](../frontend/state.md#guest-diary-2026-10-03) へ接続します。

## Logout and profile

- [サイドバーのログアウト](../../../src/layout/AppSidebar.tsx) はAuth sign-out、primary color override解除、LocalUserContext初期化、`/login` への移動を行います。
- 表示名の更新先は [Firestoreのプロフィール設定](../firestore/settings.md#usersuidsettingsprofile) を参照してください。
