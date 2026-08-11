import type {
  DiaryCard,
  DiaryCardImage,
  DiaryCardTag,
} from "@/features/createDiary/hooks/useDiaryCard";

const DATABASE_NAME = "memoir-ai-drafts";
const DATABASE_VERSION = 1;
const IMAGE_STORE = "draft-images";
const DRAFT_PREFIX = "memoir-ai:draft:v1";

type StoredDraftImage = {
  key: string;
  id: string;
  file: File;
};

type StoredDraftCard = {
  id: string;
  body: string;
  tags: DiaryCardTag[];
  date: string;
  imageIds: string[];
};

export type DiaryDraftV1 = {
  version: 1;
  uid: string;
  date: string;
  updatedAt: string;
  cards: StoredDraftCard[];
};

const getDraftKey = (uid: string, date: string) =>
  `${DRAFT_PREFIX}:${uid}:${date}`;

const getStoredDraft = (uid: string, date: string): DiaryDraftV1 | null => {
  const value = localStorage.getItem(getDraftKey(uid, date));
  if (!value) return null;

  try {
    const draft = JSON.parse(value) as DiaryDraftV1;
    if (draft.version !== 1 || draft.uid !== uid || draft.date !== date) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
};

const getImageKey = (
  uid: string,
  date: string,
  cardId: string,
  imageId: string,
) => `${uid}:${date}:${cardId}:${imageId}`;

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(IMAGE_STORE)) {
        database.createObjectStore(IMAGE_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runImageTransaction = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE, mode);
    const request = operation(transaction.objectStore(IMAGE_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
};

const saveImage = (image: StoredDraftImage) =>
  runImageTransaction("readwrite", (store) => store.put(image));

const getImage = (key: string) =>
  runImageTransaction<StoredDraftImage | undefined>("readonly", (store) =>
    store.get(key),
  );

const deleteImage = (key: string) =>
  runImageTransaction("readwrite", (store) => store.delete(key));

export class DiaryDraftClient {
  static hasContent(cards: DiaryCard[]) {
    return cards.some(
      (card) =>
        card.body.trim().length > 0 ||
        card.tags.length > 0 ||
        card.images.length > 0,
    );
  }

  static async save(uid: string, date: string, cards: DiaryCard[]) {
    const previousDraft = getStoredDraft(uid, date);
    const draft: DiaryDraftV1 = {
      version: 1,
      uid,
      date,
      updatedAt: new Date().toISOString(),
      cards: cards.map((card) => ({
        id: card.id,
        body: card.body,
        tags: card.tags,
        date: card.date.toISOString(),
        imageIds: card.images.map((image) => image.id),
      })),
    };

    await Promise.all(
      cards.flatMap((card) =>
        card.images.map((image) =>
          saveImage({
            key: getImageKey(uid, date, card.id, image.id),
            id: image.id,
            file: image.file,
          }),
        ),
      ),
    );
    const nextImageKeys = new Set(
      draft.cards.flatMap((card) =>
        card.imageIds.map((imageId) =>
          getImageKey(uid, date, card.id, imageId),
        ),
      ),
    );
    await Promise.all(
      (previousDraft?.cards ?? []).flatMap((card) =>
        card.imageIds
          .map((imageId) => getImageKey(uid, date, card.id, imageId))
          .filter((key) => !nextImageKeys.has(key))
          .map(deleteImage),
      ),
    );
    localStorage.setItem(getDraftKey(uid, date), JSON.stringify(draft));
  }

  static async load(uid: string, date: string): Promise<DiaryCard[] | null> {
    const draft = getStoredDraft(uid, date);
    if (!draft) return null;

    return Promise.all(
      draft.cards.map(async (card) => {
        const images = (
          await Promise.all(
            card.imageIds.map(async (imageId) => {
              const stored = await getImage(
                getImageKey(uid, date, card.id, imageId),
              );
              if (!stored) return null;
              return {
                id: stored.id,
                file: stored.file,
                previewUrl: URL.createObjectURL(stored.file),
              } satisfies DiaryCardImage;
            }),
          )
        ).filter((image): image is DiaryCardImage => image !== null);

        return {
          id: card.id,
          title: "",
          body: card.body,
          tags: card.tags,
          images,
          date: new Date(card.date),
          isCollapsed: false,
          isRemoving: false,
        } satisfies DiaryCard;
      }),
    );
  }

  static async clear(uid: string, date: string, cards?: DiaryCard[]) {
    const storedDraft = getStoredDraft(uid, date);
    const imageKeys = new Set(
      (storedDraft?.cards ?? []).flatMap((card) =>
        card.imageIds.map((imageId) =>
          getImageKey(uid, date, card.id, imageId),
        ),
      ),
    );
    cards?.forEach((card) =>
      card.images.forEach((image) =>
        imageKeys.add(getImageKey(uid, date, card.id, image.id)),
      ),
    );
    await Promise.all(Array.from(imageKeys, (key) => deleteImage(key)));
    localStorage.removeItem(getDraftKey(uid, date));
  }
}
