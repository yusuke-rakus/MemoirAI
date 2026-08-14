# UI rules

この文書は安定したUI実装方針です。現在のtoken、component、参照実装は`../project/frontend/ui.md`を正本とします。

## Components and styling

- 新規UIは`src/components/ui`のshadcn/ui primitiveを優先する。
- UI primitiveへfeature logic、Firebase access、domain固有copyを入れない。
- feature固有UIはfeature内、複数featureで使うapp固有UIは`src/components/shared`へ置く。
- UI再利用のために別featureをimportしない。
- 通常UIの色は意味的tokenを使い、raw hex colorや一時的な色utilityを追加しない。
- 条件付きclassは`cn`を使い、PrettierのTailwind class sortに従う。
- inline styleはruntime値などclassで表現できない場合に限定する。
- dependencyのdark modeは、そのlibrary固有のCSS variableをapp tokenへ接続する。
- theme基盤を局所変更のついでに全面整理しない。

## Layout and accessibility

- route contentは共通layoutのcontainerを再利用し、feature側で同じ外枠を重ねない。
- spacingは近接画面、responsiveはmobile-firstと既存breakpointを基準にする。
- icon-only buttonには操作内容が分かる日本語の`aria-label`を付ける。
- loadingの`role="status"`や`aria-live`など既存のaccessibility属性を維持する。
- motion追加時は`prefers-reduced-motion`対応を確認する。

## Dialog and forms

- Dialogはshadcn / Radixの構成要素を組み合わせ、action hierarchyを既存Dialogに合わせる。
- mutation中はcloseと重複submitを抑止し、disabled状態と進行中labelを表示する。
- nested Dialogは外側を誤って閉じないDOM / Portal構造にする。
- 既存formはreact-hook-form、zod、`zodResolver`、shadcn Form primitiveを再利用する。
- schemaはconsumerの近くに置き、複数consumerが必要になってから共通化する。
- validation errorは`FormMessage`または既存flowに合うinline errorで表示する。
- 小変更で関係しないform / state基盤を全面移行しない。

## Loading, empty, and feedback

- page / sectionをblockするloading、layout既知のSkeleton、compactなSpinnerを用途で使い分ける。
- section全体のempty stateはshadcn `Empty`を使い、次の行動がある場合はactionを置く。
- mutation errorはsonner toast、文脈や再試行が必要なfetch errorはinline表示も使う。
- ToasterはAppに一つだけ置く。

## Not established

正式なtypography scale、共通error-state component、全form共通のstate方式、UI copy規則は確立していません。
