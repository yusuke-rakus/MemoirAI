import type { Timestamp } from "firebase/firestore";

export type MemoryFactStatus = "active" | "archived" | "contradicted";

export type MemoryFact = {
  value: string;
  confidence: number;
  sourceDiaryIds: string[];
  firstSeenAt: Timestamp;
  lastSeenAt: Timestamp;
  status: MemoryFactStatus;
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
  sourceDiaryIds: string[];
  firstMentionedAt: Timestamp;
  lastMentionedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ActivePersonMemory = Omit<
  PersonMemory,
  "attributes" | "relationshipNotes" | "relationshipToUser"
> & {
  relationshipToUser?: MemoryFact;
  attributes: MemoryFact[];
  relationshipNotes: MemoryFact[];
};

export type ActiveUserMemoryContext = {
  profileFacts: UserProfileMemoryFact[];
  preferences: UserMemoryFact[];
  people: ActivePersonMemory[];
};

export type ExtractedMemoryFact = {
  value: string;
  confidence: number;
};

export type ExtractedProfileFact = ExtractedMemoryFact & {
  key: UserMemoryProfileKey;
};

export type ExtractedPersonMemory = {
  name: string;
  aliases?: string[];
  relationshipToUser?: ExtractedMemoryFact;
  attributes?: ExtractedMemoryFact[];
  relationshipNotes?: ExtractedMemoryFact[];
};

export type ExtractedUserMemory = {
  profileFacts?: ExtractedProfileFact[];
  preferences?: ExtractedMemoryFact[];
  people?: ExtractedPersonMemory[];
};
