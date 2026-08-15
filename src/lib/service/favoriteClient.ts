import { db } from "@/firebase/firebase";
import type { Favorite } from "@/types/favorite";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

const getFavoriteDocument = (uid: string, sharedDiaryId: string) => {
  if (!uid) {
    throw new Error("uid is required to access a favorite.");
  }
  if (!sharedDiaryId) {
    throw new Error("sharedDiaryId is required to access a favorite.");
  }

  return doc(db, "users", uid, "favorites", sharedDiaryId);
};

export class FavoriteClient {
  static async exists(uid: string, sharedDiaryId: string): Promise<boolean> {
    const snapshot = await getDoc(getFavoriteDocument(uid, sharedDiaryId));
    return snapshot.exists();
  }

  static async add(uid: string, sharedDiaryId: string): Promise<void> {
    const favorite: Favorite = { sharedDiaryId };
    await setDoc(getFavoriteDocument(uid, sharedDiaryId), favorite);
  }

  static async delete(uid: string, sharedDiaryId: string): Promise<void> {
    await deleteDoc(getFavoriteDocument(uid, sharedDiaryId));
  }
}
