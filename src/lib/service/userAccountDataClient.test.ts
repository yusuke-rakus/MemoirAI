import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserAccountDataClient } from "./userAccountDataClient";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn((value: number) => ({ type: "limit", value })),
  query: vi.fn((target: unknown, ...constraints: unknown[]) => ({
    target,
    constraints,
  })),
  serverTimestamp: vi.fn(() => "server-timestamp"),
  timestampFromDate: vi.fn((value: Date) => ({ value })),
  where: vi.fn((...values: unknown[]) => ({ type: "where", values })),
  batchDelete: vi.fn(),
  batchUpdate: vi.fn(),
  batchCommit: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({ db: { name: "test-db" } }));

vi.mock("firebase/firestore", () => ({
  collection: mocks.collection,
  deleteDoc: mocks.deleteDoc,
  doc: mocks.doc,
  getDocs: mocks.getDocs,
  limit: mocks.limit,
  query: mocks.query,
  serverTimestamp: mocks.serverTimestamp,
  Timestamp: { fromDate: mocks.timestampFromDate },
  where: mocks.where,
  writeBatch: vi.fn(() => ({
    delete: mocks.batchDelete,
    update: mocks.batchUpdate,
    commit: mocks.batchCommit,
  })),
}));

beforeEach(() => {
  mocks.collection.mockImplementation((_db, ...segments) => ({ segments }));
  mocks.doc.mockImplementation((_db, ...segments) => ({ segments }));
  mocks.batchCommit.mockResolvedValue(undefined);
  mocks.deleteDoc.mockResolvedValue(undefined);
});

describe("UserAccountDataClient", () => {
  it("private dataレジストリを削除し、legal acceptanceは削除しない", async () => {
    mocks.getDocs.mockResolvedValue({ empty: true, docs: [] });

    await UserAccountDataClient.deletePrivateData("user-1");

    const collectionPaths = mocks.collection.mock.calls.map((call) =>
      call.slice(1).join("/"),
    );
    expect(collectionPaths).toEqual([
      "users/user-1/diaries",
      "users/user-1/favorites",
      "users/user-1/settings/memory/profileFacts",
      "users/user-1/settings/memory/preferences",
      "users/user-1/settings/memory/people",
    ]);
    expect(collectionPaths).not.toContain("users/user-1/legalAcceptances");
    expect(mocks.deleteDoc).toHaveBeenCalledTimes(4);
  });

  it("共有日記をbatch削除し、空になるまで再取得する", async () => {
    const sharedDocument = { ref: { path: "sharedDiaries/share-1" } };
    mocks.getDocs
      .mockResolvedValueOnce({ empty: false, docs: [sharedDocument] })
      .mockResolvedValueOnce({ empty: true, docs: [] });

    await UserAccountDataClient.deleteSharedDiaries("user-1");

    expect(mocks.where).toHaveBeenCalledWith("uid", "==", "user-1");
    expect(mocks.batchDelete).toHaveBeenCalledWith(sharedDocument.ref);
    expect(mocks.batchCommit).toHaveBeenCalledOnce();
  });

  it("未処理の同意記録だけに削除日時と5年後の期限を設定する", async () => {
    const retained = {
      ref: { path: "users/user-1/legalAcceptances/old" },
      data: () => ({ accountDeletedAt: {}, retentionExpiresAt: {} }),
    };
    const active = {
      ref: { path: "users/user-1/legalAcceptances/v1" },
      data: () => ({ confirmedAdult: true }),
    };
    mocks.getDocs.mockResolvedValue({ empty: false, docs: [retained, active] });

    await UserAccountDataClient.retainLegalAcceptances("user-1");

    expect(mocks.batchUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.batchUpdate).toHaveBeenCalledWith(
      active.ref,
      expect.objectContaining({
        accountDeletedAt: "server-timestamp",
        retentionExpiresAt: expect.any(Object),
      }),
    );
    expect(mocks.batchCommit).toHaveBeenCalledOnce();
  });
});
