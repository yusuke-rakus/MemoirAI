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

export type UserMemorySettings = {
  uid: string;
  schemaVersion: 1;
  habits: MemoryFact[];
  goals: MemoryFact[];
  concerns: MemoryFact[];
  summary: string;
  lastExtractedDiaryId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserProfileMemoryFact = MemoryFact & {
  id: string;
  key: UserMemoryProfileKey;
};

export type UserPreferenceMemoryFact = MemoryFact & {
  id: string;
};

export type PersonMemory = {
  id: string;
  name: string;
  aliases: string[];
  relationshipToUser?: MemoryFact;
  attributes: MemoryFact[];
  relationshipNotes: MemoryFact[];
  summary: string;
  sourceDiaryIds: string[];
  firstMentionedAt: Timestamp;
  lastMentionedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  summary?: string;
};

export type ExtractedUserMemory = {
  profileFacts?: ExtractedProfileFact[];
  preferences?: ExtractedMemoryFact[];
  habits?: ExtractedMemoryFact[];
  goals?: ExtractedMemoryFact[];
  concerns?: ExtractedMemoryFact[];
  people?: ExtractedPersonMemory[];
  summary?: string;
};
