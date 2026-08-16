import { db } from "@/firebase/firebase";
import type { Favorite } from "@/types/favorite";
import {
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  runTransaction,
  serverTimestamp,
  startAfter,
  type WithFieldValue,
} from "firebase/firestore";

const FAVORITE_PAGE_SIZE = 10;

export type FavoritePageCursor = QueryDocumentSnapshot<DocumentData>;

export type FavoritePage = {
  favorites: Favorite[];
  cursor: FavoritePageCursor | null;
  hasMore: boolean;
};

const getFavoriteCollection = (uid: string) => {
  if (!uid) {
    throw new Error("uid is required to access favorites.");
  }

  return collection(db, "users", uid, "favorites");
};

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
    const favoriteDocument = getFavoriteDocument(uid, sharedDiaryId);

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(favoriteDocument);
      if (snapshot.exists()) {
        return;
      }

      const favorite: WithFieldValue<Favorite> = {
        sharedDiaryId,
        createdAt: serverTimestamp(),
      };
      transaction.set(favoriteDocument, favorite);
    });
  }

  static async delete(uid: string, sharedDiaryId: string): Promise<void> {
    await deleteDoc(getFavoriteDocument(uid, sharedDiaryId));
  }

  static async getByUidPaged(
    uid: string,
    cursor?: FavoritePageCursor | null,
    pageSize: number = FAVORITE_PAGE_SIZE,
  ): Promise<FavoritePage> {
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 10) {
      throw new Error("favorite pageSize must be an integer from 1 to 10.");
    }

    const favoritesRef = getFavoriteCollection(uid);
    const favoritesQuery = cursor
      ? query(
          favoritesRef,
          orderBy("createdAt", "desc"),
          startAfter(cursor),
          limit(pageSize + 1),
        )
      : query(favoritesRef, orderBy("createdAt", "desc"), limit(pageSize + 1));
    const snapshot = await getDocs(favoritesQuery);
    const pageDocuments = snapshot.docs.slice(0, pageSize);

    return {
      favorites: pageDocuments.map(
        (favoriteDocument) => favoriteDocument.data() as Favorite,
      ),
      cursor: pageDocuments[pageDocuments.length - 1] ?? null,
      hasMore: snapshot.docs.length > pageSize,
    };
  }
}
