import { db } from "@/firebase/firebase";
import { normalizeDisplayName } from "@/constants/userProfile";
import { generateShareId } from "@/lib/generateId";
import type { Diary } from "@/types/diary/diary";
import {
  collection,
  deleteField,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";

type ShareResult = {
  shareId: string;
};

export type UnshareResult = {
  wasShared: boolean;
};

export type SharedDiaryResult<T> = {
  sharedDiaryId: string;
  diary: T;
};

const validateDiaryIdentity = (diary: Pick<Diary, "id" | "uid">) => {
  if (!diary.uid) {
    throw new Error("Diary must contain a 'uid' field to share.");
  }
  if (!diary.id) {
    throw new Error("Diary must contain an 'id' field to share.");
  }
};

const getStoredShareId = (data: Record<string, unknown>) => {
  if (data.shareId === undefined) {
    return null;
  }
  if (typeof data.shareId !== "string" || !data.shareId) {
    throw new Error("Diary contains an invalid 'shareId' field.");
  }

  return data.shareId;
};

const assertSharedDiaryOwner = (
  data: Record<string, unknown>,
  expectedUid: string,
) => {
  if (data.uid !== expectedUid) {
    throw new Error("Shared diary owner does not match the source diary.");
  }
};

export class SharedDiaryClient {
  static async publish(
    diary: Diary,
    displayName?: string | null,
  ): Promise<ShareResult> {
    validateDiaryIdentity(diary);

    const sourceDiaryRef = doc(db, "users", diary.uid, "diaries", diary.id);
    const legacySharedDiaryRef = doc(db, "sharedDiaries", diary.id);
    const nextShareId = generateShareId();

    const shareId = await runTransaction(db, async (transaction) => {
      const sourceDiarySnapshot = await transaction.get(sourceDiaryRef);

      if (!sourceDiarySnapshot.exists()) {
        throw new Error("Source diary does not exist.");
      }

      const sourceDiary = sourceDiarySnapshot.data() as Record<string, unknown>;
      assertSharedDiaryOwner(sourceDiary, diary.uid);

      const storedShareId = getStoredShareId(sourceDiary);
      let resolvedShareId = storedShareId;

      if (!resolvedShareId) {
        const legacySharedDiarySnapshot =
          await transaction.get(legacySharedDiaryRef);

        if (legacySharedDiarySnapshot.exists()) {
          assertSharedDiaryOwner(
            legacySharedDiarySnapshot.data() as Record<string, unknown>,
            diary.uid,
          );
          resolvedShareId = diary.id;
        } else {
          resolvedShareId = nextShareId;
        }
      }

      const publicDiary = { ...sourceDiary };
      delete publicDiary.shareId;
      const sharedDiaryRef = doc(db, "sharedDiaries", resolvedShareId);

      transaction.set(sharedDiaryRef, {
        ...publicDiary,
        displayName: normalizeDisplayName(displayName),
        sharedAt: new Date(),
      });
      transaction.update(sourceDiaryRef, { shareId: resolvedShareId });

      return resolvedShareId;
    });

    return { shareId };
  }

  static async getActiveShareId(
    diary: Pick<Diary, "id" | "uid" | "shareId">,
  ): Promise<string | null> {
    validateDiaryIdentity(diary);

    const shareId = diary.shareId ?? diary.id;
    const snapshot = await getDoc(doc(db, "sharedDiaries", shareId));

    if (!snapshot.exists()) {
      return null;
    }

    assertSharedDiaryOwner(
      snapshot.data() as Record<string, unknown>,
      diary.uid,
    );
    return shareId;
  }

  static async unpublish(
    diary: Pick<Diary, "id" | "uid">,
  ): Promise<UnshareResult> {
    validateDiaryIdentity(diary);

    const sourceDiaryRef = doc(db, "users", diary.uid, "diaries", diary.id);
    const legacySharedDiaryRef = doc(db, "sharedDiaries", diary.id);

    return runTransaction(db, async (transaction) => {
      const sourceDiarySnapshot = await transaction.get(sourceDiaryRef);

      if (!sourceDiarySnapshot.exists()) {
        throw new Error("Source diary does not exist.");
      }

      const sourceDiary = sourceDiarySnapshot.data() as Record<string, unknown>;
      assertSharedDiaryOwner(sourceDiary, diary.uid);

      const storedShareId = getStoredShareId(sourceDiary);
      const sharedDiaryRef = storedShareId
        ? doc(db, "sharedDiaries", storedShareId)
        : legacySharedDiaryRef;
      const sharedDiarySnapshot = await transaction.get(sharedDiaryRef);

      if (!sharedDiarySnapshot.exists()) {
        if (storedShareId) {
          transaction.update(sourceDiaryRef, { shareId: deleteField() });
        }
        return { wasShared: false };
      }

      assertSharedDiaryOwner(
        sharedDiarySnapshot.data() as Record<string, unknown>,
        diary.uid,
      );
      transaction.delete(sharedDiaryRef);
      if (storedShareId) {
        transaction.update(sourceDiaryRef, { shareId: deleteField() });
      }

      return { wasShared: true };
    });
  }

  static async getByShareId<T extends Record<string, unknown>>(
    shareId: string,
  ): Promise<T | null> {
    const sharedDiaryRef = doc(db, "sharedDiaries", shareId);
    const snapshot = await getDoc(sharedDiaryRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as T;
  }

  static async getByShareIds<T extends Record<string, unknown>>(
    shareIds: string[],
  ): Promise<SharedDiaryResult<T>[]> {
    const uniqueShareIds = [...new Set(shareIds)];

    if (uniqueShareIds.length === 0) {
      return [];
    }
    if (uniqueShareIds.some((shareId) => !shareId)) {
      throw new Error("shareIds must not contain an empty ID.");
    }
    if (uniqueShareIds.length > 10) {
      throw new Error("A maximum of 10 shared diary IDs can be fetched.");
    }

    const sharedDiariesQuery = query(
      collection(db, "sharedDiaries"),
      where(documentId(), "in", uniqueShareIds),
    );
    const snapshot = await getDocs(sharedDiariesQuery);

    return snapshot.docs.map((sharedDiaryDocument) => ({
      sharedDiaryId: sharedDiaryDocument.id,
      diary: sharedDiaryDocument.data() as T,
    }));
  }
}
