# Current Firebase Authentication

snapshot metadataは`../firebase.md`、route境界は`../frontend/routing.md`を参照してください。

## Login and restoration

- main sourceは共有hook `src/hooks/useGoogleLogin.ts`、ログイン画面用の`useLogin.ts`、`useAuthCheck.ts`、`AppSidebar.tsx`です。共有hookはGoogle popup認証・重複実行防止・成功／失敗通知を担当し、画面遷移はcallerが担当します。
- providerは`GoogleAuthProvider`一つで、追加scopeやpersistence設定はありません。
- Email / Passwordとanonymous authは使用しません。
- loginは`signInWithPopup`、auth state監視は`onAuthStateChanged`です。
- Firebaseがnew userと判定した場合だけappearanceとprofileを初期化します。
- display nameはFirestore `settings/profile.displayName` → Firebase Auth `displayName` → nullの順で解決します。
- login toastもFirestore profileを優先します。

popup成功後のmigrationまたはprofile read失敗も「Googleでのログインに失敗」と通知します。catchでsign-outしないため、Auth sessionが成立済みの場合があります。

auth observer内のappearance / profile readには専用catchがありません。失敗時はlocal user / `user`を更新せず、loadingだけを解除します。

## Logout and profile

- logoutはAuth sign-out、primary color override解除、LocalUserContext初期化、`/login` navigateを行います。
- display name更新はFirestore profileと既存shared documentsを更新します。
- Firebase Auth profileの`displayName`は更新しません。
