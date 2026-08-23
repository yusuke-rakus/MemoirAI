# Legal document management

snapshot metadataは`../frontend.md`を参照してください。リーガル本文と表示metadataの正本は`src/features/legal/documents/*.md`、検証・同期処理の正本は`scripts/legalDocuments.ts`です。

## Documents and rendering

| File             | Document ID   | Public section       |
| ---------------- | ------------- | -------------------- |
| `terms.md`       | `terms`       | `/legal#terms`       |
| `privacy.md`     | `privacy`     | `/legal#privacy`     |
| `ai-data-use.md` | `ai-data-use` | `/legal#ai-data-use` |

各MarkdownはViteのraw importでbuildへ同梱し、`react-markdown`と`remark-gfm`で描画します。raw HTMLは描画しません。front matterは`yaml`とzodで検証します。

必須front matter:

```yaml
id: terms
title: 利用規約
version: 2026-08-22.ca94caf1
effectiveDate: 2026-08-22
introduction: 文書の導入文
```

`version`は`YYYY-MM-DD.<本文SHA-256先頭8文字>`です。UIには日付部分だけを表示し、同意証跡には完全なversionを保存します。

## Editing workflow

1. 対象Markdownのfront matterまたは本文を編集します。条項見出しは`###`を使います。
2. 文書の改定日を変える場合は`version`の日付部分と`effectiveDate`を明示的に更新します。
3. `pnpm legal:sync`で本文hashをversion末尾へ同期します。
4. `pnpm legal:check`、test、buildを実行します。buildは最初に`legal:check`を実行します。
5. 利用目的、外部送信、AI処理、共有範囲等の重要変更では、Markdown更新に加えて`REQUIRED_LEGAL_CONSENT_VERSION`を更新し、再同意を要求します。表現修正だけでは必須同意versionを更新しません。

`legal:check`は3ファイルの存在、front matter schema、document IDとfileの対応、ID重複、日付、version形式、本文hashを検証します。
