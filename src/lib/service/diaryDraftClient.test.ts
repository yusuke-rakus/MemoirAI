import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { DiaryDraftClient } from "./diaryDraftClient";

const DATABASE_NAME = "memoir-ai-drafts";
const IMAGE_STORE = "draft-images";

const deleteDatabase = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

const seedDraftImages = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(IMAGE_STORE, { keyPath: "key" });
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction(IMAGE_STORE, "readwrite");
      const store = transaction.objectStore(IMAGE_STORE);
      store.put({ key: "user-1:2026-08-24:card-1:image-1" });
      store.put({ key: "user-2:2026-08-24:card-1:image-2" });
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    };
  });

const getDraftImageKeys = () =>
  new Promise<IDBValidKey[]>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction(IMAGE_STORE, "readonly");
      const keysRequest = transaction.objectStore(IMAGE_STORE).getAllKeys();
      keysRequest.onsuccess = () => resolve(keysRequest.result);
      keysRequest.onerror = () => reject(keysRequest.error);
      transaction.oncomplete = () => database.close();
    };
  });

beforeEach(async () => {
  localStorage.clear();
  await deleteDatabase();
});

describe("DiaryDraftClient.clearAllByUid", () => {
  it("対象UIDのlocalStorageとIndexedDBだけを削除する", async () => {
    localStorage.setItem("memoir-ai:draft:v1:user-1:2026-08-24", "draft-1");
    localStorage.setItem("memoir-ai:draft:v1:user-1:2026-08-25", "draft-2");
    localStorage.setItem("memoir-ai:draft:v1:user-2:2026-08-24", "draft-3");
    await seedDraftImages();

    await DiaryDraftClient.clearAllByUid("user-1");

    expect(
      localStorage.getItem("memoir-ai:draft:v1:user-1:2026-08-24"),
    ).toBeNull();
    expect(
      localStorage.getItem("memoir-ai:draft:v1:user-1:2026-08-25"),
    ).toBeNull();
    expect(localStorage.getItem("memoir-ai:draft:v1:user-2:2026-08-24")).toBe(
      "draft-3",
    );
    await expect(getDraftImageKeys()).resolves.toEqual([
      "user-2:2026-08-24:card-1:image-2",
    ]);
  });
});
