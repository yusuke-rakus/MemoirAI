export type MemoryFact = {
  value: string;
  confidence: number;
};

export type UserMemoryProfileKey =
  | "displayName"
  | "ageRange"
  | "gender"
  | "occupation"
  | "location"
  | "familyStatus";

export type UserProfileMemoryFact = MemoryFact & {
  id: string;
  key: UserMemoryProfileKey;
};

export type UserMemoryFact = MemoryFact & {
  id: string;
};

export type PersonMemory = {
  id: string;
  name: string;
  aliases: string[];
  relationshipToUser?: MemoryFact;
  attributes: MemoryFact[];
  relationshipNotes: MemoryFact[];
};

export type ActiveUserMemoryContext = {
  profileFacts: UserProfileMemoryFact[];
  preferences: UserMemoryFact[];
  people: PersonMemory[];
};

export type ExtractedProfileFact = MemoryFact & {
  key: UserMemoryProfileKey;
};

export type ExtractedPersonMemory = {
  name: string;
  aliases?: string[];
  relationshipToUser?: MemoryFact;
  attributes?: MemoryFact[];
  relationshipNotes?: MemoryFact[];
};

export type ExtractedUserMemory = {
  profileFacts?: ExtractedProfileFact[];
  preferences?: MemoryFact[];
  people?: ExtractedPersonMemory[];
};
