# Current Firestore map

調査の基準点は 2026-08-14、`da479d8` です。現在のpathとfieldは各詳細が参照する実装と型を確認してください。アクセス範囲と開発データは [Firestore Rules](../../firebase/firestore.rules) と [seed処理](../../scripts/seed.ts) で確認できます。

サービス横断の資料は [Firebaseの入口](firebase.md) を参照してください。

## Path overview

```text
users/{uid}
├─ diaries/{diaryId}
├─ favorites/{sharedDiaryId}
├─ legalAcceptances/{requiredConsentVersion}
└─ settings
   ├─ appearance
   ├─ profile
   └─ memory
      ├─ profileFacts/{factId}
      ├─ preferences/{factId}
      └─ people/{personId}

sharedDiaries/{shareId}
```

`users/{uid}`rootと`settings/memory`parentへのapp writeは確認できません。parent documentがなくてもsubcollection documentは保存できます。

## Detailed snapshots

- [日記のfield・query・書き込み](firestore/diaries.md)
- [お気に入りのfield・読み書き](firestore/favorites.md)
- [外観とプロフィールの設定](firestore/settings.md)
- [長期記憶](firestore/memory.md)
- [共有日記と同期境界](firestore/sharing.md)
- [利用規約等の同意証跡](firestore/legal-consent.md)
- [Security Rules・index・seed](firestore/security-and-seed.md)
