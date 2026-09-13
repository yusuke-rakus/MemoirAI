import { describe, expect, it } from "vitest";

import { getUserMemoryUpdates } from "../userMemoryMerge";

describe("getUserMemoryUpdates", () => {
  it("updates matching facts without changing their persisted IDs", () => {
    const updates = getUserMemoryUpdates(
      {
        profileFacts: [
          {
            id: "profile-1",
            key: "occupation",
            value: "エンジニア",
            confidence: 0.4,
          },
        ],
        preferences: [
          { id: "preference-1", value: "コーヒー", confidence: 0.6 },
        ],
        people: [],
      },
      {
        profileFacts: [
          { key: "occupation", value: "エンジニア", confidence: 0.9 },
        ],
        preferences: [{ value: " コーヒー ", confidence: 0.8 }],
      },
    );

    expect(updates.profileFacts).toEqual([
      {
        id: "profile-1",
        key: "occupation",
        value: "エンジニア",
        confidence: 0.9,
      },
    ]);
    expect(updates.preferences).toEqual([
      { id: "preference-1", value: "コーヒー", confidence: 0.8 },
    ]);
    expect(updates.people).toEqual([]);
  });

  it("merges an extracted person with an existing alias", () => {
    const updates = getUserMemoryUpdates(
      {
        profileFacts: [],
        preferences: [],
        people: [
          {
            id: "person-1",
            name: "太郎",
            aliases: ["たろう"],
            attributes: [{ value: "学生", confidence: 0.6 }],
            relationshipNotes: [],
          },
        ],
      },
      {
        people: [
          {
            name: "たろう",
            aliases: ["Taro"],
            relationshipToUser: { value: "友人", confidence: 0.8 },
            attributes: [{ value: "学生", confidence: 0.9 }],
          },
        ],
      },
    );

    expect(updates.people).toEqual([
      {
        id: "person-1",
        name: "太郎",
        aliases: ["たろう", "Taro"],
        relationshipToUser: { value: "友人", confidence: 0.8 },
        attributes: [{ value: "学生", confidence: 0.9 }],
        relationshipNotes: [],
      },
    ]);
  });

  it("does not emit writes when extracted data has no effective change", () => {
    const updates = getUserMemoryUpdates(
      {
        profileFacts: [],
        preferences: [{ id: "preference-1", value: "読書", confidence: 0.8 }],
        people: [],
      },
      {
        preferences: [
          { value: "読書", confidence: 0.4 },
          { value: "   ", confidence: 1 },
        ],
      },
    );

    expect(updates).toEqual({
      profileFacts: [],
      preferences: [],
      people: [],
    });
  });
});
