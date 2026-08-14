# Bugfix workflow

## 1. Establish evidence

- 症状、期待behavior、再現条件、影響範囲を分ける。
- `../rules/testing.md`に沿って変更前のbaselineを確認する。
- 実際のrender/data pathを入口から追い、推測した原因を先にfixしない。
- UI不具合は同種のsibling implementation、Firebase不具合はclient・types・rules・seedを比較する。

## 2. Isolate the cause

- state、event、route param、service result、persisted dataのどの境界で期待とずれるか特定する。
- 現在のfailureと、指定された回帰commitがある場合のbefore/afterを分ける。
- source inspection、runtime reproduction、browser/Emulator確認を混同しない。
- 既存の一貫したpatternと異なる箇所が他にもあれば、修正対象か関連issueかを分けて報告する。

## 3. Apply the smallest structural fix

- 原因となる境界を局所的に直す。
- event suppressionや広いworkaroundより、既存component/provider/service構造に沿うfixを優先する。
- user data、shared copy、画像など複数resourceへ影響する場合はfailure時の部分更新を確認する。

## 4. Verify regression coverage

- 元の再現手順が解消したことを確認する。
- `../rules/testing.md`から変更範囲に合う推奨checkを選ぶ。
- 隣接する正常case、反対条件、loading/error/empty、mobile/desktopなどから影響するcaseを選ぶ。
- automated test基盤がない場合、行った手動確認と残るriskを明示する。
- targeted checkとrepository-wide checkを別々に報告する。

## 5. Update context only when structural

bugfixが現在の構造理解を変えた場合だけ、関係する`../project/`を更新します。挙動を元へ戻すだけの局所fixでは文書更新不要です。目標architectureの設計判断も変更する場合だけ`../architecture/`を更新します。
