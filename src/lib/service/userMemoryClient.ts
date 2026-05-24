import { db } from "@/firebase/firebase";
import { generateMemoryFactId, generatePersonMemoryId } from "@/lib/generateId";
import type {
  ActivePersonMemory,
  ActiveUserMemoryContext,
  ExtractedMemoryFact,
  ExtractedProfileFact,
  ExtractedPersonMemory,
  ExtractedUserMemory,
  MemoryFact,
  PersonMemory,
  UserMemoryFact,
  UserMemoryProfileKey,
  UserProfileMemoryFact,
} from "@/types/memory";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

const MEMORY_SETTINGS_DOC_ID = "memory";
const PEOPLE_COLLECTION_ID = "people";
const PREFERENCES_COLLECTION_ID = "preferences";
const PROFILE_FACTS_COLLECTION_ID = "profileFacts";

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

const filterActiveMemoryFacts = <T extends MemoryFact>(facts: T[] = []) =>
  facts.filter((fact) => fact.status === "active");

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

const mergeCollectionFacts = (
  current: UserMemoryFact[] = [],
  extracted: ExtractedMemoryFact[] = [],
  diaryId: string,
  now: Timestamp,
): UserMemoryFact[] => {
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
    sourceDiaryIds: uniqueIds([...current.sourceDiaryIds, diaryId]),
    lastMentionedAt: now,
    updatedAt: now,
  };
};

const filterActivePersonMemory = (person: PersonMemory): ActivePersonMemory => ({
  ...person,
  relationshipToUser:
    person.relationshipToUser?.status === "active"
      ? person.relationshipToUser
      : undefined,
  attributes: filterActiveMemoryFacts(person.attributes),
  relationshipNotes: filterActiveMemoryFacts(person.relationshipNotes),
});

export class UserMemoryClient {
  private static async getMemoryFacts(
    uid: string,
    collectionId: string,
  ): Promise<UserMemoryFact[]> {
    if (!uid) {
      throw new Error("uid is required to fetch memory facts.");
    }

    const factsRef = collection(
      db,
      "users",
      uid,
      "settings",
      MEMORY_SETTINGS_DOC_ID,
      collectionId,
    );
    const snapshot = await getDocs(factsRef);

    return snapshot.docs.map((doc) => doc.data() as UserMemoryFact);
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

  static async getPreferences(uid: string): Promise<UserMemoryFact[]> {
    if (!uid) {
      throw new Error("uid is required to fetch preference memory.");
    }

    return UserMemoryClient.getMemoryFacts(uid, PREFERENCES_COLLECTION_ID);
  }

  static async getActiveMemoryContext(
    uid: string,
  ): Promise<ActiveUserMemoryContext> {
    if (!uid) {
      throw new Error("uid is required to fetch active user memory.");
    }

    const [profileFacts, preferences, people] = await Promise.all([
      UserMemoryClient.getProfileFacts(uid),
      UserMemoryClient.getPreferences(uid),
      UserMemoryClient.getPeople(uid),
    ]);

    return {
      profileFacts: filterActiveMemoryFacts(profileFacts),
      preferences: filterActiveMemoryFacts(preferences),
      people: people.map(filterActivePersonMemory).filter(
        (person) =>
          person.relationshipToUser ||
          person.attributes.length > 0 ||
          person.relationshipNotes.length > 0,
      ),
    };
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
    const [currentProfileFacts, currentPreferences, currentPeople] =
      await Promise.all([
        UserMemoryClient.getProfileFacts(uid),
        UserMemoryClient.getPreferences(uid),
        UserMemoryClient.getPeople(uid),
      ]);

    const peopleToSave = (extracted.people ?? [])
      .filter((person) => person.name.trim())
      .map((person) =>
        mergePerson(findExistingPerson(currentPeople, person), person, diaryId, now),
    );
    const profileFactsToSave = mergeProfileFacts(
      currentProfileFacts,
      extracted.profileFacts,
      diaryId,
      now,
    );
    const preferencesToSave = mergeCollectionFacts(
      currentPreferences,
      extracted.preferences,
      diaryId,
      now,
    );

    const batch = writeBatch(db);
    const memoryRef = doc(db, "users", uid, "settings", MEMORY_SETTINGS_DOC_ID);
    const memorySnapshot = await getDoc(memoryRef);
    if (memorySnapshot.exists()) {
      batch.set(
        memoryRef,
        {
          uid: deleteField(),
          schemaVersion: deleteField(),
          profile: deleteField(),
          preferences: deleteField(),
          habits: deleteField(),
          goals: deleteField(),
          concerns: deleteField(),
          summary: deleteField(),
          lastExtractedDiaryId: deleteField(),
          createdAt: deleteField(),
          updatedAt: deleteField(),
        },
        { merge: true },
      );
    }

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
      batch.set(
        personRef,
        {
          ...person,
          summary: deleteField(),
        },
        { merge: true },
      );
    });

    await batch.commit();
  }
}
