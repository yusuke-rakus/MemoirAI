import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserStorageClient } from "./userStorageClient";

const mocks = vi.hoisted(() => ({
  deleteObject: vi.fn(),
  list: vi.fn(),
  ref: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({ storage: { name: "test-storage" } }));

vi.mock("firebase/storage", () => ({
  deleteObject: mocks.deleteObject,
  list: mocks.list,
  ref: mocks.ref,
}));

beforeEach(() => {
  mocks.ref.mockImplementation((_storage, path) => ({ fullPath: path }));
  mocks.deleteObject.mockResolvedValue(undefined);
});

describe("UserStorageClient", () => {
  it("user prefixをページングし、子prefixと孤立画像をすべて削除する", async () => {
    const root = { fullPath: "users/user-1" };
    const diaryPrefix = { fullPath: "users/user-1/diaries" };
    const rootImage = { fullPath: "users/user-1/orphan.webp" };
    const nestedImage = {
      fullPath: "users/user-1/diaries/diary-1/images/image.webp",
    };
    mocks.ref.mockReturnValue(root);
    mocks.list.mockImplementation(async (folder, options) => {
      if (folder === root && !options.pageToken) {
        return {
          items: [rootImage],
          prefixes: [diaryPrefix],
          nextPageToken: "next",
        };
      }
      if (folder === root) {
        return { items: [], prefixes: [] };
      }
      return { items: [nestedImage], prefixes: [] };
    });

    await UserStorageClient.deleteAllByUid("user-1");

    expect(mocks.ref).toHaveBeenCalledWith(
      { name: "test-storage" },
      "users/user-1",
    );
    expect(mocks.deleteObject).toHaveBeenCalledWith(rootImage);
    expect(mocks.deleteObject).toHaveBeenCalledWith(nestedImage);
    expect(mocks.list).toHaveBeenCalledWith(
      root,
      expect.objectContaining({ pageToken: "next" }),
    );
  });
});
