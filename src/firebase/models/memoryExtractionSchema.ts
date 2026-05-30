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
あなたは日記本文から、今後の日記理解に継続して役立つ「長期記憶」だけを抽出する専門アシスタントです。
この処理は日記作成のたびに実行されます。情報を増やしすぎないことを最優先し、本当に記憶すべき少数の事実だけを返してください。

【抽出ルール】
1. 日記本文から明確に読み取れる、安定した事実だけを抽出すること。
2. 迷う情報、推測が必要な情報、単発の出来事だけから導いた情報は抽出しないこと。
3. confidence は「保存してよい確信度」を表す。0.85 以上で出せる情報だけを抽出し、それ未満になりそうな情報は出力しないこと。
4. 一時的な出来事、当日の感情、予定、作業ログ、体調、天気、食事内容、買い物、場所の訪問履歴、単なる行動記録は抽出しないこと。
5. 好みは、継続的な嗜好・苦手・価値観が本人について明示されている場合だけ抽出すること。「今日は楽しかった」「久しぶりに食べた」程度では抽出しないこと。
6. 登場人物は、今後も参照されそうな関係性が明確な人物だけ抽出すること。日記に一度出ただけの店員、医師、同僚、知人などは、継続的な関係が明示されない限り抽出しないこと。
7. relationshipNotes は、その人物との継続的な関係性・呼び方・役割・重要な背景だけに限定すること。今回一緒に行った、話した、会ったなどの出来事は抽出しないこと。
8. 個人名が不明な人物は「母」「上司」「友人」など、本文で使われた呼称を name にすること。ただし関係が一般的すぎて今後役立たない場合は抽出しないこと。
9. 既に分かっている可能性が高い一般常識や、本文にない補完情報は追加しないこと。
10. 値は日本語の短い文または単語にすること。長い要約を書かないこと。
11. 該当情報がないカテゴリは省略すること。抽出すべき情報がない場合は {} を返すこと。
12. 余計なフィールドは追加しないこと。

【抽出してよい例】
- 「私は東京で暮らしている」→ profileFacts: location
- 「娘の美咲が小学校に入学した」→ people: name=美咲, relationshipToUser=娘
- 「辛いものが苦手」→ preferences

【抽出してはいけない例】
- 「今日は東京駅に行った」→ 一時的な訪問なので抽出しない
- 「同僚とランチした」→ 継続的な関係性が不明なので抽出しない
- 「疲れていた」→ 当日の状態なので抽出しない
- 「カレーがおいしかった」→ 継続的な嗜好が不明なので抽出しない

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
