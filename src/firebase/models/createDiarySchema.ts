import { tagColors } from "@/constants/tagColors";
import { getGenerativeModel, Schema } from "firebase/ai";
import { ai, DEFAULT_MODEL } from "./models";

const diaryTitleSchema = Schema.object({
  properties: {
    title: Schema.string(),
    tags: Schema.array({
      items: Schema.object({
        properties: {
          name: Schema.string(),
          color: Schema.enumString({
            enum: tagColors,
          }),
        },
      }),
    }),
  },
  optionalProperties: ["tags"],
});

const instruction = `
あなたは日本語の日記要約とメタデータ生成の専門アシスタントです。
日記本文をもとに、短いタイトルと関連タグを生成してください。

【タスク】
1. 日記の内容を象徴する絵文字をタイトルの先頭に1つだけ付けること。
2. タイトルは日本語で10〜20字程度の短いフレーズにまとめること。
3. タグは日記のテーマ・感情・行動・場所などを要約した「日本語の単語」にすること。
4. タグは1〜5個生成すること。
5. タグの name はシンプルな単語にする（文章にしない／絵文字を含めない）。
6. タグの color は用意された enum から適切なものを1つ割り当てること。
7. 不要な記号は付けず、余計なフィールドは追加しないこと。

【出力形式】
必ず次のJSON形式のみで返してください：

{
  "title": "🎉タイトル例",
  "tags": [
    {"name": "タグ1", "color": "tag-amber"},
    {"name": "タグ2", "color": "tag-violet"}
  ]
}
`;

const diaryTitleModel = getGenerativeModel(ai, {
  model: DEFAULT_MODEL,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: diaryTitleSchema,
  },
  systemInstruction: instruction,
});

export { diaryTitleModel, diaryTitleSchema };
