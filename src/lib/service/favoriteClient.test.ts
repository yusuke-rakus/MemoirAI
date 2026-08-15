import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoriteClient, type FavoritePageCursor } from "./favoriteClient";

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(),
  startAfter: vi.fn(),
  transactionGet: vi.fn(),
  transactionSet: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  db: { name: "test-db" },
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collection,
  deleteDoc: firestoreMocks.deleteDoc,
  doc: firestoreMocks.doc,
  getDoc: firestoreMocks.getDoc,
  getDocs: firestoreMocks.getDocs,
  limit: firestoreMocks.limit,
  orderBy: firestoreMocks.orderBy,
  query: firestoreMocks.query,
  runTransaction: firestoreMocks.runTransaction,
  serverTimestamp: firestoreMocks.serverTimestamp,
  startAfter: firestoreMocks.startAfter,
}));

beforeEach(() => {
  firestoreMocks.collection.mockImplementation((_db, ...segments) => ({
    type: "collection",
    segments,
  }));
  firestoreMocks.doc.mockImplementation((_db, ...segments) => ({
    type: "document",
    segments,
  }));
  firestoreMocks.limit.mockImplementation((value) => ({ limit: value }));
  firestoreMocks.orderBy.mockImplementation((field, direction) => ({
    orderBy: [field, direction],
  }));
  firestoreMocks.query.mockImplementation((...constraints) => constraints);
  firestoreMocks.serverTimestamp.mockReturnValue("server-timestamp");
  firestoreMocks.startAfter.mockImplementation((cursor) => ({
    startAfter: cursor,
  }));
  firestoreMocks.runTransaction.mockImplementation(
    async (_db, transactionFunction) =>
      transactionFunction({
        get: firestoreMocks.transactionGet,
        set: firestoreMocks.transactionSet,
      }),
  );
});

describe("FavoriteClient", () => {
  it("空のUIDをFirestoreへ渡す前に拒否する", async () => {
    await expect(FavoriteClient.getByUidPaged("")).rejects.toThrowError(
      "uid is required to access favorites.",
    );

    expect(firestoreMocks.collection).not.toHaveBeenCalled();
  });

  it("未登録の場合だけserver timestamp付き文書を作成する", async () => {
    firestoreMocks.transactionGet.mockResolvedValue({
      exists: () => false,
    });

    await FavoriteClient.add("user-1", "shared-1");

    expect(firestoreMocks.transactionSet).toHaveBeenCalledWith(
      expect.objectContaining({
        segments: ["users", "user-1", "favorites", "shared-1"],
      }),
      {
        sharedDiaryId: "shared-1",
        createdAt: "server-timestamp",
      },
    );
  });

  it("登録済みの場合はcreatedAtを更新しない", async () => {
    firestoreMocks.transactionGet.mockResolvedValue({
      exists: () => true,
    });

    await FavoriteClient.add("user-1", "shared-1");

    expect(firestoreMocks.transactionSet).not.toHaveBeenCalled();
  });

  it("createdAtの新しい順で10件と次pageのcursorを返す", async () => {
    const documents = Array.from({ length: 11 }, (_, index) => ({
      id: `favorite-${index}`,
      data: () => ({
        sharedDiaryId: `shared-${index}`,
        createdAt: { seconds: 100 - index },
      }),
    }));
    firestoreMocks.getDocs.mockResolvedValue({ docs: documents });

    const page = await FavoriteClient.getByUidPaged("user-1");

    expect(firestoreMocks.orderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(firestoreMocks.limit).toHaveBeenCalledWith(11);
    expect(page.favorites).toHaveLength(10);
    expect(page.cursor).toBe(documents[9]);
    expect(page.hasMore).toBe(true);
  });

  it("指定cursorの次から要求件数を取得する", async () => {
    const cursor = { id: "cursor" } as FavoritePageCursor;
    firestoreMocks.getDocs.mockResolvedValue({ docs: [] });

    await FavoriteClient.getByUidPaged("user-1", cursor, 5);

    expect(firestoreMocks.startAfter).toHaveBeenCalledWith(cursor);
    expect(firestoreMocks.limit).toHaveBeenCalledWith(6);
  });

  it("page sizeは1から10だけを受け付ける", async () => {
    await expect(
      FavoriteClient.getByUidPaged("user-1", null, 0),
    ).rejects.toThrowError(
      "favorite pageSize must be an integer from 1 to 10.",
    );
    await expect(
      FavoriteClient.getByUidPaged("user-1", null, 11),
    ).rejects.toThrowError(
      "favorite pageSize must be an integer from 1 to 10.",
    );
  });
});
