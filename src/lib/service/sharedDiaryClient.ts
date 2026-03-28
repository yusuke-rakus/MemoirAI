import { db } from "@/firebase/firebase";
import type { Diary } from "@/types/diary/diary";
import { doc, getDoc, setDoc } from "firebase/firestore";

type ShareResult = {
  shareId: string;
};

export class SharedDiaryClient {
  static async publish(diary: Diary): Promise<ShareResult> {
    if (!diary.uid) {
      throw new Error("Diary must contain a 'uid' field to share.");
    }
    if (!diary.id) {
      throw new Error("Diary must contain an 'id' field to share.");
    }

    const shareId = diary.id;
    const sharedDiaryRef = doc(db, "shared", "diaries");
    await setDoc(sharedDiaryRef, {
      [shareId]: {
        ...diary,
        sharedAt: new Date(),
      },
    }, { merge: true });

    return { shareId };
  }

  static async getByShareId<T extends Record<string, unknown>>(
    shareId: string,
  ): Promise<T | null> {
    const sharedDiaryRef = doc(db, "shared", "diaries");
    const snapshot = await getDoc(sharedDiaryRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    const sharedDiary = data[shareId];
    if (!sharedDiary) {
      return null;
    }

    return sharedDiary as T;
  }
}
