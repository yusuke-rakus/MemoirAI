import { getGenerativeModel, Schema } from "firebase/ai";
import { ai, DEFAULT_MODEL } from "./models";

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

const testModel = getGenerativeModel(ai, {
  model: DEFAULT_MODEL,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: testJsonSchema,
  },
  systemInstruction: "日本語で回答してください",
});

export { testJsonSchema, testModel };
