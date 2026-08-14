# Frontend architecture

この文書はfrontend各層の責務を定義します。現在のProvider、route、state、逸脱は`../project/frontend.md`を正本とします。

## Layer responsibilities

| Layer                 | Responsibility                                |
| --------------------- | --------------------------------------------- |
| app composition       | root Provider、route、feature entryの組み立て |
| router / layout       | navigation shell、認証境界、route共通領域     |
| feature               | 一つのユーザー目的に閉じたUI、状態、use-case  |
| shared component      | 複数featureまたはshellで使うapp固有UI         |
| UI primitive          | domain非依存の見た目・interaction             |
| app-wide state / core | 複数featureが共有する状態、型、純粋なutility  |
| gateway               | Firebase SDKやbrowser APIとの接続             |

下位層からapp compositionへ逆依存しません。外部I/Oの境界は`data-access.md`を参照します。

## Feature and UI composition

- `src/features/<feature>`から別featureをimportしません。
- app固有の共有UIは`src/components/shared`、feature非依存のprimitiveは`src/components/ui`へ置きます。
- 共通化は複数の現在のconsumerと責務を確認してから行います。
- route entryがProvider、feature hook / use-case、Viewを組み合わせます。
- componentはrender、入力、ユーザー操作の通知を中心にします。
- layoutへ個別featureの業務処理を取り込みません。

## State ownership

| Scope                        | Owner                                      |
| ---------------------------- | ------------------------------------------ |
| component / Dialog内         | local state / form state                   |
| 一つのfeature内              | feature hook、Context、feature-local store |
| 複数featureまたはapp shell   | app-wide Context / store                   |
| 外部サービス由来の取得・更新 | feature hook / use-case                    |

global stateは複数consumerに必要な最小情報に限定します。

## Routing and authentication

- routeとfeature entryの割り当てはapp compositionが担当します。
- 認証必須領域と公開領域をroute treeで分離し、認証判定をroute / layout boundaryへ集約します。
- route parameterはfeature境界までにruntime validationし、fallbackを明示します。
- not-found、route error、loadingはrouter責務として設計します。
