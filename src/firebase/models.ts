import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
} from "firebase/ai";
import { app } from "./firebase";

const DEFAULT_MODEL = "gemini-2.5-flash";

const testJsonSchema = Schema.object({
  properties: {
    characters: Schema.array({
      items: Schema.object({
        properties: {
          age: Schema.number(),
          name: Schema.string(),
          species: Schema.string(),
          accessory: Schema.string(),
        },
        optionalProperties: ["accessory"],
      }),
    }),
  },
});

const diaryTitleSchema = Schema.object({
  properties: {
    title: Schema.string(),
  },
});

const ai = getAI(app, { backend: new GoogleAIBackend() });

const testModel = getGenerativeModel(ai, {
  model: DEFAULT_MODEL,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: testJsonSchema,
  },
  systemInstruction: "日本語で回答してください",
});

const diaryTitleModel = getGenerativeModel(ai, {
  model: DEFAULT_MODEL,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: diaryTitleSchema,
  },
  systemInstruction:
    "与えられた日記本文から日本語で短いタイトルを1つ生成してください。タイトルの先頭に、その内容を象徴する絵文字を1つ含めて返してください。絵文字を別フィールドには分けず、タイトル文字列に含めてください。",
});

export { ai, diaryTitleModel, diaryTitleSchema, testJsonSchema, testModel };
