import type { Diary } from "@/types/diary/diary";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SharedDiaryClient } from "./sharedDiaryClient";

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  deleteField: vi.fn(),
  doc: vi.fn(),
  documentId: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  transactionDelete: vi.fn(),
  transactionGet: vi.fn(),
  transactionSet: vi.fn(),
  transactionUpdate: vi.fn(),
  where: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  db: { name: "test-db" },
}));

vi.mock("@/lib/generateId", () => ({
  generateShareId: () => "share-new",
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collection,
  deleteField: firestoreMocks.deleteField,
  doc: firestoreMocks.doc,
  documentId: firestoreMocks.documentId,
  getDoc: firestoreMocks.getDoc,
  getDocs: firestoreMocks.getDocs,
  query: firestoreMocks.query,
  runTransaction: firestoreMocks.runTransaction,
  where: firestoreMocks.where,
}));

const diary = {
  id: "diary-1",
  uid: "user-1",
  title: "夏の思い出",
  content: "海へ行きました。",
  tags: [],
  date: { seconds: 1 },
  createdAt: { seconds: 2 },
} as unknown as Diary;

const createSnapshot = (
  data?: Record<string, unknown>,
): { exists: () => boolean; data: () => Record<string, unknown> } => ({
  exists: () => data !== undefined,
  data: () => data ?? {},
});

beforeEach(() => {
  vi.clearAllMocks();
  firestoreMocks.doc.mockImplementation((...segments: unknown[]) => ({
    segments: segments.slice(1),
  }));
  firestoreMocks.deleteField.mockReturnValue("delete-field");
  firestoreMocks.documentId.mockReturnValue("document-id");
  firestoreMocks.getDocs.mockResolvedValue({ docs: [] });
  firestoreMocks.runTransaction.mockImplementation(
    async (_db, callback: (transaction: unknown) => unknown) =>
      callback({
        delete: firestoreMocks.transactionDelete,
        get: firestoreMocks.transactionGet,
        set: firestoreMocks.transactionSet,
        update: firestoreMocks.transactionUpdate,
      }),
  );
});

describe("SharedDiaryClient.publish", () => {
  it("新しい共有IDで公開コピーと元日記を同時に更新する", async () => {
    firestoreMocks.transactionGet
      .mockResolvedValueOnce(createSnapshot(diary))
      .mockResolvedValueOnce(createSnapshot());

    await expect(
      SharedDiaryClient.publish(diary, "テストユーザー"),
    ).resolves.toEqual({ shareId: "share-new" });

    expect(firestoreMocks.transactionSet).toHaveBeenCalledWith(
      expect.objectContaining({ segments: ["sharedDiaries", "share-new"] }),
      expect.objectContaining({
        id: "diary-1",
        uid: "user-1",
        displayName: "テストユーザー",
        sharedAt: expect.any(Date),
      }),
    );
    expect(firestoreMocks.transactionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        segments: ["users", "user-1", "diaries", "diary-1"],
      }),
      { shareId: "share-new" },
    );
  });

  it("共有中は既存IDを再利用し、管理用shareIdを公開しない", async () => {
    firestoreMocks.transactionGet.mockResolvedValueOnce(
      createSnapshot({ ...diary, shareId: "share-active" }),
    );

    await expect(SharedDiaryClient.publish(diary)).resolves.toEqual({
      shareId: "share-active",
    });

    const publicDiary = firestoreMocks.transactionSet.mock.calls[0]?.[1];
    expect(publicDiary).not.toHaveProperty("shareId");
    expect(firestoreMocks.transactionGet).toHaveBeenCalledOnce();
  });

  it("旧形式の公開コピーがあれば日記IDを引き続き使用する", async () => {
    firestoreMocks.transactionGet
      .mockResolvedValueOnce(createSnapshot(diary))
      .mockResolvedValueOnce(createSnapshot({ ...diary, sharedAt: {} }));

    await expect(SharedDiaryClient.publish(diary)).resolves.toEqual({
      shareId: "diary-1",
    });
  });
});

describe("SharedDiaryClient share status and unpublish", () => {
  it("保存済みshareIdの公開コピーが存在する場合だけ共有中と判定する", async () => {
    firestoreMocks.getDoc.mockResolvedValue(createSnapshot({ uid: "user-1" }));

    await expect(
      SharedDiaryClient.getActiveShareId({
        id: diary.id,
        uid: diary.uid,
        shareId: "share-active",
      }),
    ).resolves.toBe("share-active");
    expect(firestoreMocks.doc).toHaveBeenLastCalledWith(
      { name: "test-db" },
      "sharedDiaries",
      "share-active",
    );
  });

  it("shareIdがない既存日記では従来の日記IDを確認する", async () => {
    firestoreMocks.getDoc.mockResolvedValue(createSnapshot({ uid: "user-1" }));

    await expect(SharedDiaryClient.getActiveShareId(diary)).resolves.toBe(
      "diary-1",
    );
  });

  it("公開コピーを削除して元日記のshareIdを除去する", async () => {
    firestoreMocks.transactionGet
      .mockResolvedValueOnce(
        createSnapshot({ ...diary, shareId: "share-active" }),
      )
      .mockResolvedValueOnce(createSnapshot({ uid: "user-1" }));

    await expect(SharedDiaryClient.unpublish(diary)).resolves.toEqual({
      wasShared: true,
    });
    expect(firestoreMocks.transactionDelete).toHaveBeenCalledWith(
      expect.objectContaining({ segments: ["sharedDiaries", "share-active"] }),
    );
    expect(firestoreMocks.transactionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        segments: ["users", "user-1", "diaries", "diary-1"],
      }),
      { shareId: "delete-field" },
    );
  });

  it("旧形式の公開コピーも削除できる", async () => {
    firestoreMocks.transactionGet
      .mockResolvedValueOnce(createSnapshot(diary))
      .mockResolvedValueOnce(createSnapshot({ uid: "user-1" }));

    await expect(SharedDiaryClient.unpublish(diary)).resolves.toEqual({
      wasShared: true,
    });
    expect(firestoreMocks.transactionDelete).toHaveBeenCalledWith(
      expect.objectContaining({ segments: ["sharedDiaries", "diary-1"] }),
    );
    expect(firestoreMocks.transactionUpdate).not.toHaveBeenCalled();
  });
});

describe("SharedDiaryClient.getByShareIds", () => {
  it("空配列ではFirestoreへアクセスしない", async () => {
    await expect(SharedDiaryClient.getByShareIds([])).resolves.toEqual([]);

    expect(firestoreMocks.getDocs).not.toHaveBeenCalled();
  });

  it("最大10件の共有日記をID付きで取得する", async () => {
    firestoreMocks.getDocs.mockResolvedValue({
      docs: [
        { id: "shared-2", data: () => ({ title: "日記2" }) },
        { id: "shared-1", data: () => ({ title: "日記1" }) },
      ],
    });

    const diaries = await SharedDiaryClient.getByShareIds([
      "shared-1",
      "shared-2",
    ]);

    expect(firestoreMocks.where).toHaveBeenCalledWith("document-id", "in", [
      "shared-1",
      "shared-2",
    ]);
    expect(diaries).toEqual([
      { sharedDiaryId: "shared-2", diary: { title: "日記2" } },
      { sharedDiaryId: "shared-1", diary: { title: "日記1" } },
    ]);
  });

  it("空IDと11件以上の取得を拒否する", async () => {
    await expect(
      SharedDiaryClient.getByShareIds(["shared-1", ""]),
    ).rejects.toThrowError("shareIds must not contain an empty ID.");
    await expect(
      SharedDiaryClient.getByShareIds(
        Array.from({ length: 11 }, (_, index) => `shared-${index}`),
      ),
    ).rejects.toThrowError("A maximum of 10 shared diary IDs can be fetched.");
  });
});
