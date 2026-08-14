# Current Firestore map

最終確認: 2026-08-14、検証対象のsource snapshot `da479d8`。このmetadataは`firestore/`配下にも適用します。

code、types、Security Rules、seedから確認できる現在状態です。Firebase全体は`firebase.md`を参照してください。

## Path overview

```text
users/{uid}
├─ diaries/{diaryId}
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

- diary fields、query、writer: `firestore/diaries.md`
- appearanceとprofile settings: `firestore/settings.md`
- long-term memory: `firestore/memory.md`
- shared diaryと同期境界: `firestore/sharing.md`
- Security Rules、index、seed: `firestore/security-and-seed.md`
