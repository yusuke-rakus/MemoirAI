import { z } from "zod";

import { diaryTagSchema } from "@/lib/diaryMetadata";

export const guestDiaryDraftSchema = z.object({
  date: z.string().datetime({ offset: true }),
  content: z.string(),
  tags: z.array(diaryTagSchema),
});

export const guestDiarySchema = guestDiaryDraftSchema.extend({
  content: z.string().trim().min(1),
  id: z.string().regex(/^diary-[\da-f-]{36}$/i),
  title: z.string().trim().min(1),
  createdAt: z.string().datetime({ offset: true }),
  imageId: z.string().regex(/^diary-image-[\da-f-]{36}$/i),
  image: z
    .custom<Blob>(
      (value) =>
        value instanceof Blob &&
        value.size > 0 &&
        ["image/png", "image/jpeg", "image/webp"].includes(value.type),
    )
    .optional(),
  targetUid: z.string().min(1).optional(),
});

const recordSchema = z.object({
  version: z.literal(1),
  draft: guestDiaryDraftSchema,
  diary: guestDiarySchema.optional(),
});

export type GuestDiaryDraft = z.infer<typeof guestDiaryDraftSchema>;
export type GuestDiary = z.infer<typeof guestDiarySchema>;
export type GuestDiaryRecord = z.infer<typeof recordSchema>;

const DATABASE_NAME = "memoir-ai-guest-diary";
const STORE = "diary";
const KEY = "current";

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// Resolve only after commit: a successful request can still be rolled back.
const transaction = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, finish: (value: T) => void) => void,
): Promise<T> => {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = database.transaction(STORE, mode);
      let value: T;
      let failure: unknown;
      tx.oncomplete = () => resolve(value);
      tx.onabort = () =>
        reject(failure ?? tx.error ?? new Error("端末への保存に失敗しました"));
      tx.onerror = () => {
        failure ??= tx.error;
      };
      try {
        operation(tx.objectStore(STORE), (result) => {
          value = result;
        });
      } catch (error) {
        failure = error;
        tx.abort();
      }
    });
  } finally {
    database.close();
  }
};

export class GuestDiaryClient {
  static async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    if (!navigator.locks) {
      throw new Error(
        "このブラウザでは日記を安全に保存できません。最新版のブラウザでお試しください。",
      );
    }
    return navigator.locks.request("memoir-ai:guest-diary", operation);
  }

  static async load(): Promise<GuestDiaryRecord | null> {
    const raw = await transaction<unknown>("readonly", (store, finish) => {
      const request = store.get(KEY);
      request.onsuccess = () => finish(request.result);
    });
    return raw === undefined ? null : recordSchema.parse(raw);
  }

  static async saveDraft(
    draft: GuestDiaryDraft,
    shouldSave: () => boolean = () => true,
  ): Promise<void> {
    const parsed = guestDiaryDraftSchema.parse(draft);
    await this.exclusive(async () => {
      if (!shouldSave()) return;
      const current = await this.load();
      // A stale editor must not replace a result created in another tab.
      if (current?.diary || !shouldSave()) return;
      await this.write({ version: 1, draft: parsed });
    });
  }

  static async write(record: GuestDiaryRecord): Promise<void> {
    const parsed = recordSchema.parse(record);
    await transaction<void>("readwrite", (store, finish) => {
      store.put(parsed, KEY);
      finish(undefined);
    });
  }

  static async clear(): Promise<void> {
    await transaction<void>("readwrite", (store, finish) => {
      store.delete(KEY);
      finish(undefined);
    });
  }
}
