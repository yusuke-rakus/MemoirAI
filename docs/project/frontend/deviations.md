# Current frontend deviations

以下は目標architectureとの差異であり、新規実装の前例にしません。snapshot metadataは`../frontend.md`を参照してください。

## Feature-to-feature imports

- sharedDiary → login (`LoginHeader`)
- sharedDiary → createDiary (`DiaryTag`)、diaries (`DiaryImageGrid`)
- diaries → createDiary (`DiaryTag`)
- home → diaries (`DiaryDetailNavigationState`)
- layout → sidebar (`AppSidebar`)、searchDiary (`MainLayout`)

## Component to gateway / SDK

- `DiarySearchDialog` → `DiaryClient`
- `SettingsDialog` → `UserMemoryClient`
- `ProfileSettingsForm` → `UserProfileClient`
- `AppSidebar` → Auth SDK `getAuth` / `signOut`

## Other SDK coupling

- `useAuthCheck` → `onAuthStateChanged`
- `useLogin` → `signInWithPopup` / `getAdditionalUserInfo`
- `src/features/diaries/hooks/useDiaryPreviewActions.ts` → Firestore `Timestamp`
- `src/features/createDiary/hooks/useCreateDiary.ts` → `src/firebase/models`
- Auth serviceとfeature向けAI gatewayはありません。

## Reverse or ambiguous placement

- `DiaryDraftClient` → `src/features/createDiary/hooks/useDiaryCard.ts`の型
- `src/components/shared/calendar/MonthSelectorScrollButton.tsx` → homeだけ
- `src/components/shared/background/pixelBlast.tsx` → loginだけ
- `src/components/shared/common/useRotatingText.ts` → createDiaryだけ

## Duplication and missing boundaries

- createDiary / diariesの`DiaryDetailProvider`とstore、sidebarのProvider / storeが類似します。
- `EmptyDiaries`、`DiaryTag`に複数実装またはfeature間再利用があります。
- `NewDiaryView`と`SettingsDialog`はUIと複数interactionを所有します。
- form schemaはcomponent同居が中心で、card composerはcustom stateです。
- nested Dialogのtopologyは統一されていません。
- Error Boundary、repository / domain / use-case layer、feature依存を強制するlint ruleはありません。
