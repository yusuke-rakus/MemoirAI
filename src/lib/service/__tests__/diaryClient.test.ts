import { beforeEach, describe, expect, it, vi } from "vitest";

import { DiaryClient } from "../diaryClient";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  transaction: vi.fn(),
  doc: vi.fn(),
}));
vi.mock("@/firebase/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: mocks.doc,
  getDoc: mocks.get,
  getDocs: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  runTransaction: mocks.transaction,
  setDoc: vi.fn(),
  startAfter: vi.fn(),
  Timestamp: {},
  where: vi.fn(),
}));

const diary = { uid: "owner", id: "diary-1", content: "本文" };
beforeEach(() => {
  mocks.doc.mockReturnValue({ path: "users/owner/diaries/diary-1" });
  mocks.transaction.mockImplementation((_db, operation) =>
    operation({ get: mocks.get, set: mocks.set }),
  );
});

describe("DiaryClient.addIfAbsent", () => {
  it("未登録の日記をtransaction内でユーザー専用pathへ保存する", async () => {
    mocks.get.mockResolvedValue({ exists: () => false });
    await DiaryClient.addIfAbsent(diary);
    expect(mocks.doc).toHaveBeenCalledWith(
      {},
      "users",
      "owner",
      "diaries",
      "diary-1",
    );
    expect(mocks.set).toHaveBeenCalledWith(
      { path: "users/owner/diaries/diary-1" },
      diary,
    );
  });

  it("同じ日記が登録済みなら上書きしない", async () => {
    mocks.get.mockResolvedValue({
      exists: () => true,
      data: () => ({ ...diary, content: "編集済み" }),
    });
    await DiaryClient.addIfAbsent(diary);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("既存documentの所有者が異なる場合は失敗する", async () => {
    mocks.get.mockResolvedValue({
      exists: () => true,
      data: () => ({ ...diary, uid: "other" }),
    });
    await expect(DiaryClient.addIfAbsent(diary)).rejects.toThrow("ownership");
    await expect(DiaryClient.exists(diary.uid, diary.id)).rejects.toThrow(
      "ownership",
    );
    expect(mocks.set).not.toHaveBeenCalled();
  });
});
