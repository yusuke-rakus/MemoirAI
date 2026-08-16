import { beforeEach, describe, expect, it, vi } from "vitest";
import { SharedDiaryClient } from "./sharedDiaryClient";

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  doc: vi.fn(),
  documentId: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  setDoc: vi.fn(),
  where: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  db: { name: "test-db" },
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collection,
  doc: firestoreMocks.doc,
  documentId: firestoreMocks.documentId,
  getDoc: firestoreMocks.getDoc,
  getDocs: firestoreMocks.getDocs,
  query: firestoreMocks.query,
  setDoc: firestoreMocks.setDoc,
  where: firestoreMocks.where,
}));

beforeEach(() => {
  firestoreMocks.documentId.mockReturnValue("document-id");
  firestoreMocks.getDocs.mockResolvedValue({ docs: [] });
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
