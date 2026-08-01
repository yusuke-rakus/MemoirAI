import { db } from "@/firebase/firebase";
import { generateMemoryFactId, generatePersonMemoryId } from "@/lib/generateId";
import type {
  ActiveUserMemoryContext,
  ExtractedPersonMemory,
  ExtractedProfileFact,
  ExtractedUserMemory,
  MemoryFact,
  PersonMemory,
  UserMemoryFact,
  UserMemoryProfileKey,
  UserProfileMemoryFact,
} from "@/types/memory";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";

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

const createMemoryFact = (fact: MemoryFact): MemoryFact => ({
  value: fact.value.trim(),
  confidence: clampConfidence(fact.confidence),
});

const areMemoryFactsEqual = (
  current: MemoryFact | undefined,
  next: MemoryFact | undefined,
) => current?.value === next?.value && current?.confidence === next?.confidence;

const areMemoryFactArraysEqual = (
  current: MemoryFact[],
  next: MemoryFact[],
) =>
  current.length === next.length &&
  current.every((fact, index) => areMemoryFactsEqual(fact, next[index]));

const areStringArraysEqual = (current: string[], next: string[]) =>
  current.length === next.length &&
  current.every((value, index) => value === next[index]);

const arePeopleEqual = (current: PersonMemory, next: PersonMemory) =>
  current.id === next.id &&
  current.name === next.name &&
  areStringArraysEqual(current.aliases, next.aliases) &&
  areMemoryFactsEqual(current.relationshipToUser, next.relationshipToUser) &&
  areMemoryFactArraysEqual(current.attributes, next.attributes) &&
  areMemoryFactArraysEqual(current.relationshipNotes, next.relationshipNotes);

const upsertById = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((currentItem) => currentItem.id === item.id);
  if (index >= 0) {
    items[index] = item;
    return;
  }

  items.push(item);
};

const mergeMemoryFact = (
  current: MemoryFact | undefined,
  extracted: MemoryFact | undefined,
) => {
  if (!extracted?.value.trim()) return current;

  const next = createMemoryFact(extracted);
  if (!current) return next;

  if (normalizeText(current.value) === normalizeText(next.value)) {
    return {
      ...current,
      confidence: Math.max(current.confidence, next.confidence),
    } satisfies MemoryFact;
  }

  if (next.confidence >= current.confidence) {
    return {
      ...next,
    } satisfies MemoryFact;
  }

  return current;
};

const mergeFactArray = (
  current: MemoryFact[] = [],
  extracted: MemoryFact[] = [],
) => {
  const nextFacts = [...current];

  extracted.forEach((fact) => {
    if (!fact.value.trim()) return;

    const index = nextFacts.findIndex(
      (currentFact) =>
        normalizeText(currentFact.value) === normalizeText(fact.value),
    );

    if (index >= 0) {
      const mergedFact = mergeMemoryFact(nextFacts[index], fact);
      if (mergedFact) {
        nextFacts[index] = mergedFact;
      }
      return;
    }

    nextFacts.push(createMemoryFact(fact));
  });

  return nextFacts;
};

const mergeCollectionFacts = (
  current: UserMemoryFact[] = [],
  extracted: MemoryFact[] = [],
): UserMemoryFact[] => {
  const nextFacts = [...current];
  const factsToSave: UserMemoryFact[] = [];

  extracted.forEach((fact) => {
    if (!fact.value.trim()) return;

    const index = nextFacts.findIndex(
      (currentFact) =>
        normalizeText(currentFact.value) === normalizeText(fact.value),
    );

    if (index >= 0) {
      const currentFact = nextFacts[index];
      const mergedFact = mergeMemoryFact(currentFact, fact);
      if (mergedFact) {
        const nextFact = {
          ...mergedFact,
          id: currentFact.id,
        };
        nextFacts[index] = nextFact;
        if (!areMemoryFactsEqual(currentFact, nextFact)) {
          upsertById(factsToSave, nextFact);
        }
      }
      return;
    }

    const nextFact = {
      id: generateMemoryFactId(),
      ...createMemoryFact(fact),
    };
    nextFacts.push(nextFact);
    factsToSave.push(nextFact);
  });

  return factsToSave;
};

const mergeProfileFacts = (
  current: UserProfileMemoryFact[] = [],
  extracted: ExtractedProfileFact[] = [],
) => {
  const nextFacts = [...current];
  const factsToSave: UserProfileMemoryFact[] = [];

  extracted.forEach((fact) => {
    if (!profileKeys.has(fact.key) || !fact.value.trim()) return;

    const index = nextFacts.findIndex(
      (currentFact) => currentFact.key === fact.key,
    );

    if (index >= 0) {
      const currentFact = nextFacts[index];
      const mergedFact = mergeMemoryFact(currentFact, fact);
      if (mergedFact) {
        const nextFact = {
          ...mergedFact,
          id: currentFact.id,
          key: currentFact.key,
        };
        nextFacts[index] = nextFact;
        if (!areMemoryFactsEqual(currentFact, nextFact)) {
          upsertById(factsToSave, nextFact);
        }
      }
      return;
    }

    const nextFact = {
      id: generateMemoryFactId(),
      key: fact.key,
      ...createMemoryFact(fact),
    };
    nextFacts.push(nextFact);
    factsToSave.push(nextFact);
  });

  return factsToSave;
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
      ),
      attributes: mergeFactArray([], extracted.attributes),
      relationshipNotes: mergeFactArray([], extracted.relationshipNotes),
    };
  }

  return {
    ...current,
    name: current.name || name,
    aliases: compactUnique([...current.aliases, ...aliases]),
    relationshipToUser: mergeMemoryFact(
      current.relationshipToUser,
      extracted.relationshipToUser,
    ),
    attributes: mergeFactArray(current.attributes, extracted.attributes),
    relationshipNotes: mergeFactArray(
      current.relationshipNotes,
      extracted.relationshipNotes,
    ),
  };
};

const mergePeople = (
  currentPeople: PersonMemory[],
  extractedPeople: ExtractedPersonMemory[] = [],
) => {
  const knownPeople = [...currentPeople];
  const peopleToSave: PersonMemory[] = [];

  extractedPeople
    .filter((person) => person.name.trim())
    .forEach((person) => {
      const currentPerson = findExistingPerson(knownPeople, person);
      const mergedPerson = mergePerson(currentPerson, person);
      const knownIndex = knownPeople.findIndex(
        (knownPerson) => knownPerson.id === mergedPerson.id,
      );

      if (knownIndex >= 0) {
        knownPeople[knownIndex] = mergedPerson;
      } else {
        knownPeople.push(mergedPerson);
      }

      if (!currentPerson || !arePeopleEqual(currentPerson, mergedPerson)) {
        upsertById(peopleToSave, mergedPerson);
      }
    });

  return peopleToSave;
};

export class UserMemoryClient {
  private static async getMemoryCollection<T>(
    uid: string,
    collectionId: string,
    errorMessage: string,
  ): Promise<T[]> {
    if (!uid) {
      throw new Error(errorMessage);
    }

    const collectionRef = collection(
      db,
      "users",
      uid,
      "settings",
      MEMORY_SETTINGS_DOC_ID,
      collectionId,
    );
    const snapshot = await getDocs(collectionRef);

    return snapshot.docs.map((doc) => doc.data() as T);
  }

  static async getPeople(uid: string): Promise<PersonMemory[]> {
    return UserMemoryClient.getMemoryCollection<PersonMemory>(
      uid,
      PEOPLE_COLLECTION_ID,
      "uid is required to fetch people memory.",
    );
  }

  static async getProfileFacts(uid: string): Promise<UserProfileMemoryFact[]> {
    return UserMemoryClient.getMemoryCollection<UserProfileMemoryFact>(
      uid,
      PROFILE_FACTS_COLLECTION_ID,
      "uid is required to fetch profile memory.",
    );
  }

  static async getPreferences(uid: string): Promise<UserMemoryFact[]> {
    return UserMemoryClient.getMemoryCollection<UserMemoryFact>(
      uid,
      PREFERENCES_COLLECTION_ID,
      "uid is required to fetch preference memory.",
    );
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
      profileFacts,
      preferences,
      people: people.filter(
        (person) =>
          person.relationshipToUser ||
          person.attributes.length > 0 ||
          person.relationshipNotes.length > 0,
      ),
    };
  }

  static async mergeExtractedMemory({
    uid,
    extracted,
  }: {
    uid: string;
    extracted: ExtractedUserMemory;
  }): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to update user memory.");
    }

    const [currentProfileFacts, currentPreferences, currentPeople] =
      await Promise.all([
        UserMemoryClient.getProfileFacts(uid),
        UserMemoryClient.getPreferences(uid),
        UserMemoryClient.getPeople(uid),
      ]);

    const peopleToSave = mergePeople(currentPeople, extracted.people);
    const profileFactsToSave = mergeProfileFacts(
      currentProfileFacts,
      extracted.profileFacts,
    );
    const preferencesToSave = mergeCollectionFacts(
      currentPreferences,
      extracted.preferences,
    );
    const writeCount =
      profileFactsToSave.length + preferencesToSave.length + peopleToSave.length;
    if (writeCount === 0) return;

    const batch = writeBatch(db);

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
      batch.set(profileFactRef, profileFact);
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
      batch.set(preferenceRef, preference);
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
      batch.set(personRef, person);
    });

    await batch.commit();
  }
}
