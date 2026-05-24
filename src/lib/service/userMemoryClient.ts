import { db } from "@/firebase/firebase";
import { generateMemoryFactId, generatePersonMemoryId } from "@/lib/generateId";
import type {
  ExtractedMemoryFact,
  ExtractedProfileFact,
  ExtractedPersonMemory,
  ExtractedUserMemory,
  MemoryFact,
  PersonMemory,
  UserMemoryProfileKey,
  UserPreferenceMemoryFact,
  UserProfileMemoryFact,
  UserMemorySettings,
} from "@/types/memory";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

const MEMORY_SETTINGS_DOC_ID = "memory";
const PEOPLE_COLLECTION_ID = "people";
const PREFERENCES_COLLECTION_ID = "preferences";
const PROFILE_FACTS_COLLECTION_ID = "profileFacts";
const MEMORY_SCHEMA_VERSION = 1;
const MAX_SUMMARY_LENGTH = 3000;

type LegacyUserMemorySettings = UserMemorySettings & {
  profile?: Partial<Record<UserMemoryProfileKey, MemoryFact>>;
  preferences?: MemoryFact[];
};

const profileKeys = new Set<UserMemoryProfileKey>([
  "displayName",
  "ageRange",
  "gender",
  "occupation",
  "location",
  "familyStatus",
]);

const normalizeText = (value: string) => value.trim().toLocaleLowerCase();

const clampConfidence = (value: number) => Math.max(0, Math.min(1, value));

const compactUnique = (values: string[]) =>
  Array.from(
    new Map(
      values
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => [normalizeText(value), value]),
    ).values(),
  );

const uniqueIds = (ids: string[]) => Array.from(new Set(ids.filter(Boolean)));

const createMemoryFact = (
  fact: ExtractedMemoryFact,
  diaryId: string,
  now: Timestamp,
): MemoryFact => ({
  value: fact.value.trim(),
  confidence: clampConfidence(fact.confidence),
  sourceDiaryIds: [diaryId],
  firstSeenAt: now,
  lastSeenAt: now,
  status: "active",
});

const mergeMemoryFact = (
  current: MemoryFact | undefined,
  extracted: ExtractedMemoryFact | undefined,
  diaryId: string,
  now: Timestamp,
) => {
  if (!extracted?.value.trim()) return current;

  const next = createMemoryFact(extracted, diaryId, now);
  if (!current) return next;

  const sourceDiaryIds = uniqueIds([...current.sourceDiaryIds, diaryId]);
  if (normalizeText(current.value) === normalizeText(next.value)) {
    return {
      ...current,
      confidence: Math.max(current.confidence, next.confidence),
      sourceDiaryIds,
      lastSeenAt: now,
      status: "active",
    } satisfies MemoryFact;
  }

  if (next.confidence >= current.confidence) {
    return {
      ...next,
      sourceDiaryIds,
      firstSeenAt: current.firstSeenAt,
      status: "active",
    } satisfies MemoryFact;
  }

  return current;
};

const mergeFactArray = (
  current: MemoryFact[] = [],
  extracted: ExtractedMemoryFact[] = [],
  diaryId: string,
  now: Timestamp,
) => {
  const nextFacts = [...current];

  extracted.forEach((fact) => {
    if (!fact.value.trim()) return;

    const index = nextFacts.findIndex(
      (currentFact) =>
        normalizeText(currentFact.value) === normalizeText(fact.value),
    );

    if (index >= 0) {
      nextFacts[index] = mergeMemoryFact(
        nextFacts[index],
        fact,
        diaryId,
        now,
      ) as MemoryFact;
      return;
    }

    nextFacts.push(createMemoryFact(fact, diaryId, now));
  });

  return nextFacts;
};

const mergeSummary = (current: string, extracted?: string) => {
  const next = extracted?.trim();
  if (!next) return current;
  if (!current) return next.slice(0, MAX_SUMMARY_LENGTH);
  if (current.includes(next)) return current;

  return `${current}\n${next}`.slice(0, MAX_SUMMARY_LENGTH);
};

const createDefaultMemorySettings = (
  uid: string,
  now: Timestamp,
): UserMemorySettings => ({
  uid,
  schemaVersion: MEMORY_SCHEMA_VERSION,
  habits: [],
  goals: [],
  concerns: [],
  summary: "",
  createdAt: now,
  updatedAt: now,
});

const mergePreferenceFacts = (
  current: UserPreferenceMemoryFact[] = [],
  extracted: ExtractedMemoryFact[] = [],
  diaryId: string,
  now: Timestamp,
) => {
  const nextFacts = [...current];

  extracted.forEach((fact) => {
    if (!fact.value.trim()) return;

    const index = nextFacts.findIndex(
      (currentFact) =>
        normalizeText(currentFact.value) === normalizeText(fact.value),
    );

    if (index >= 0) {
      const currentFact = nextFacts[index];
      const mergedFact = mergeMemoryFact(currentFact, fact, diaryId, now);
      if (mergedFact) {
        nextFacts[index] = {
          ...mergedFact,
          id: currentFact.id,
        };
      }
      return;
    }

    nextFacts.push({
      id: generateMemoryFactId(),
      ...createMemoryFact(fact, diaryId, now),
    });
  });

  return nextFacts;
};

const mergeProfileFacts = (
  current: UserProfileMemoryFact[] = [],
  extracted: ExtractedProfileFact[] = [],
  diaryId: string,
  now: Timestamp,
) => {
  const nextFacts = [...current];

  extracted.forEach((fact) => {
    if (!profileKeys.has(fact.key) || !fact.value.trim()) return;

    const index = nextFacts.findIndex(
      (currentFact) =>
        currentFact.key === fact.key &&
        normalizeText(currentFact.value) === normalizeText(fact.value),
    );

    if (index >= 0) {
      const currentFact = nextFacts[index];
      const mergedFact = mergeMemoryFact(currentFact, fact, diaryId, now);
      if (mergedFact) {
        nextFacts[index] = {
          ...mergedFact,
          id: currentFact.id,
          key: currentFact.key,
        };
      }
      return;
    }

    nextFacts.push({
      id: generateMemoryFactId(),
      key: fact.key,
      ...createMemoryFact(fact, diaryId, now),
    });
  });

  return nextFacts;
};

const createProfileFactsFromLegacyProfile = (
  profile: LegacyUserMemorySettings["profile"],
): UserProfileMemoryFact[] =>
  Object.entries(profile ?? {}).flatMap(([key, fact]) => {
    const profileKey = key as UserMemoryProfileKey;

    if (!profileKeys.has(profileKey) || !fact) return [];

    return [
      {
        ...fact,
        id: generateMemoryFactId(),
        key: profileKey,
      },
    ];
  });

const createPreferencesFromLegacyPreferences = (
  preferences: LegacyUserMemorySettings["preferences"] = [],
): UserPreferenceMemoryFact[] =>
  preferences.map((preference) => ({
    ...preference,
    id: generateMemoryFactId(),
  }));

const getPersonMatchKeys = (person: Pick<PersonMemory, "aliases" | "name">) =>
  new Set([person.name, ...person.aliases].map(normalizeText));

const findExistingPerson = (
  people: PersonMemory[],
  extractedPerson: ExtractedPersonMemory,
) => {
  const extractedKeys = getPersonMatchKeys({
    name: extractedPerson.name,
    aliases: extractedPerson.aliases ?? [],
  });

  return people.find((person) => {
    const currentKeys = getPersonMatchKeys(person);
    return Array.from(extractedKeys).some((key) => currentKeys.has(key));
  });
};

const mergePerson = (
  current: PersonMemory | undefined,
  extracted: ExtractedPersonMemory,
  diaryId: string,
  now: Timestamp,
): PersonMemory => {
  const name = extracted.name.trim();
  const aliases = compactUnique(extracted.aliases ?? []);

  if (!current) {
    return {
      id: generatePersonMemoryId(),
      name,
      aliases,
      relationshipToUser: mergeMemoryFact(
        undefined,
        extracted.relationshipToUser,
        diaryId,
        now,
      ),
      attributes: mergeFactArray([], extracted.attributes, diaryId, now),
      relationshipNotes: mergeFactArray(
        [],
        extracted.relationshipNotes,
        diaryId,
        now,
      ),
      summary: extracted.summary?.trim() ?? "",
      sourceDiaryIds: [diaryId],
      firstMentionedAt: now,
      lastMentionedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    ...current,
    name: current.name || name,
    aliases: compactUnique([...current.aliases, ...aliases]),
    relationshipToUser: mergeMemoryFact(
      current.relationshipToUser,
      extracted.relationshipToUser,
      diaryId,
      now,
    ),
    attributes: mergeFactArray(
      current.attributes,
      extracted.attributes,
      diaryId,
      now,
    ),
    relationshipNotes: mergeFactArray(
      current.relationshipNotes,
      extracted.relationshipNotes,
      diaryId,
      now,
    ),
    summary: mergeSummary(current.summary, extracted.summary),
    sourceDiaryIds: uniqueIds([...current.sourceDiaryIds, diaryId]),
    lastMentionedAt: now,
    updatedAt: now,
  };
};

export class UserMemoryClient {
  static async getByUid(uid: string): Promise<UserMemorySettings | null> {
    if (!uid) {
      throw new Error("uid is required to fetch user memory.");
    }

    const memoryRef = doc(db, "users", uid, "settings", MEMORY_SETTINGS_DOC_ID);
    const snapshot = await getDoc(memoryRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as UserMemorySettings;
  }

  static async getPeople(uid: string): Promise<PersonMemory[]> {
    if (!uid) {
      throw new Error("uid is required to fetch people memory.");
    }

    const peopleRef = collection(
      db,
      "users",
      uid,
      "settings",
      MEMORY_SETTINGS_DOC_ID,
      PEOPLE_COLLECTION_ID,
    );
    const snapshot = await getDocs(peopleRef);

    return snapshot.docs.map((doc) => doc.data() as PersonMemory);
  }

  static async getProfileFacts(uid: string): Promise<UserProfileMemoryFact[]> {
    if (!uid) {
      throw new Error("uid is required to fetch profile memory.");
    }

    const profileFactsRef = collection(
      db,
      "users",
      uid,
      "settings",
      MEMORY_SETTINGS_DOC_ID,
      PROFILE_FACTS_COLLECTION_ID,
    );
    const snapshot = await getDocs(profileFactsRef);

    return snapshot.docs.map((doc) => doc.data() as UserProfileMemoryFact);
  }

  static async getPreferences(uid: string): Promise<UserPreferenceMemoryFact[]> {
    if (!uid) {
      throw new Error("uid is required to fetch preference memory.");
    }

    const preferencesRef = collection(
      db,
      "users",
      uid,
      "settings",
      MEMORY_SETTINGS_DOC_ID,
      PREFERENCES_COLLECTION_ID,
    );
    const snapshot = await getDocs(preferencesRef);

    return snapshot.docs.map((doc) => doc.data() as UserPreferenceMemoryFact);
  }

  static async mergeExtractedMemory({
    uid,
    diaryId,
    extracted,
  }: {
    uid: string;
    diaryId: string;
    extracted: ExtractedUserMemory;
  }): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to update user memory.");
    }
    if (!diaryId) {
      throw new Error("diaryId is required to update user memory.");
    }

    const now = Timestamp.now();
    const currentMemory =
      (((await UserMemoryClient.getByUid(uid)) ??
        createDefaultMemorySettings(uid, now)) as LegacyUserMemorySettings);
    const currentProfileFacts = await UserMemoryClient.getProfileFacts(uid);
    const currentPreferences = await UserMemoryClient.getPreferences(uid);
    const currentPeople = await UserMemoryClient.getPeople(uid);
    const profileFactsBase =
      currentProfileFacts.length > 0
        ? currentProfileFacts
        : createProfileFactsFromLegacyProfile(currentMemory.profile);
    const preferencesBase =
      currentPreferences.length > 0
        ? currentPreferences
        : createPreferencesFromLegacyPreferences(currentMemory.preferences);

    const memory: UserMemorySettings = {
      ...currentMemory,
      uid,
      schemaVersion: MEMORY_SCHEMA_VERSION,
      habits: mergeFactArray(currentMemory.habits, extracted.habits, diaryId, now),
      goals: mergeFactArray(currentMemory.goals, extracted.goals, diaryId, now),
      concerns: mergeFactArray(
        currentMemory.concerns,
        extracted.concerns,
        diaryId,
        now,
      ),
      summary: mergeSummary(currentMemory.summary ?? "", extracted.summary),
      lastExtractedDiaryId: diaryId,
      updatedAt: now,
    };

    const peopleToSave = (extracted.people ?? [])
      .filter((person) => person.name.trim())
      .map((person) =>
        mergePerson(findExistingPerson(currentPeople, person), person, diaryId, now),
      );
    const profileFactsToSave = mergeProfileFacts(
      profileFactsBase,
      extracted.profileFacts,
      diaryId,
      now,
    );
    const preferencesToSave = mergePreferenceFacts(
      preferencesBase,
      extracted.preferences,
      diaryId,
      now,
    );

    const batch = writeBatch(db);
    const memoryRef = doc(db, "users", uid, "settings", MEMORY_SETTINGS_DOC_ID);
    batch.set(
      memoryRef,
      {
        ...memory,
        profile: deleteField(),
        preferences: deleteField(),
      },
      { merge: true },
    );

    profileFactsToSave.forEach((profileFact) => {
      const profileFactRef = doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PROFILE_FACTS_COLLECTION_ID,
        profileFact.id,
      );
      batch.set(profileFactRef, profileFact, { merge: true });
    });

    preferencesToSave.forEach((preference) => {
      const preferenceRef = doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PREFERENCES_COLLECTION_ID,
        preference.id,
      );
      batch.set(preferenceRef, preference, { merge: true });
    });

    peopleToSave.forEach((person) => {
      const personRef = doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PEOPLE_COLLECTION_ID,
        person.id,
      );
      batch.set(personRef, person, { merge: true });
    });

    await batch.commit();
  }

  static async update(uid: string, data: Partial<UserMemorySettings>) {
    if (!uid) {
      throw new Error("uid is required to update user memory.");
    }

    const memoryRef = doc(db, "users", uid, "settings", MEMORY_SETTINGS_DOC_ID);
    await setDoc(
      memoryRef,
      {
        uid,
        ...data,
      },
      { merge: true },
    );
  }
}
