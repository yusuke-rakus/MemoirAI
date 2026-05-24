import { getGenerativeModel, Schema } from "firebase/ai";
import { ai, DEFAULT_MODEL } from "./models";

const profileKeys = [
  "displayName",
  "ageRange",
  "gender",
  "occupation",
  "location",
  "familyStatus",
];

const memoryFactSchema = Schema.object({
  properties: {
    value: Schema.string(),
    confidence: Schema.number(),
  },
});

const memoryExtractionSchema = Schema.object({
  properties: {
    // ユーザー本人の属性
    profileFacts: Schema.array({
      items: Schema.object({
        properties: {
          key: Schema.enumString({
            enum: profileKeys,
          }),
          value: Schema.string(),
          confidence: Schema.number(),
        },
      }),
    }),
    // 好み
    preferences: Schema.array({
      items: memoryFactSchema,
    }),
    // 登場人物との関係性
    people: Schema.array({
      items: Schema.object({
        properties: {
          name: Schema.string(),
          aliases: Schema.array({
            items: Schema.string(),
          }),
          relationshipToUser: memoryFactSchema,
          attributes: Schema.array({
            items: memoryFactSchema,
          }),
          relationshipNotes: Schema.array({
            items: memoryFactSchema,
          }),
        },
        optionalProperties: [
          "aliases",
          "relationshipToUser",
          "attributes",
          "relationshipNotes",
        ],
      }),
    }),
  },
  optionalProperties: [
    "profileFacts",
    "preferences",
    "people",
  ],
});

const instruction = `
あなたは日記本文から長期記憶として保存できる事実だけを抽出する専門アシスタントです。
ユーザー本人の属性、好み、登場人物との関係性を抽出してください。

【抽出ルール】
1. 日記本文から明確に読み取れる情報だけを抽出すること。
2. 推測しすぎないこと。不確かな情報は confidence を低くするか、抽出しないこと。
3. 一時的な出来事そのものではなく、今後の文脈理解に役立つ継続的な情報を抽出すること。
4. 個人名が不明な人物は「母」「上司」「友人」など、本文で使われた呼称を name にすること。
5. confidence は 0〜1 の数値にすること。
6. 値は日本語の短い文または単語にすること。
7. 該当情報がないカテゴリは省略すること。
8. 余計なフィールドは追加しないこと。

【profileFacts の key】
- displayName: ユーザーの名前や呼び名
- ageRange: 年齢層
- gender: 性別
- occupation: 職業や立場
- location: 居住地や生活圏
- familyStatus: 家族構成や婚姻状況

【出力形式】
必ず指定された JSON schema に一致する JSON のみで返してください。
`;

const memoryExtractionModel = getGenerativeModel(ai, {
  model: DEFAULT_MODEL,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: memoryExtractionSchema,
  },
  systemInstruction: instruction,
});

export { memoryExtractionModel, memoryExtractionSchema };
