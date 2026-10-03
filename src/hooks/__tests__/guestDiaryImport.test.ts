// @vitest-environment node
import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  GuestDiaryClient,
  type GuestDiaryRecord,
} from "@/lib/service/guestDiaryClient";

import { importGuestDiary } from "../useGuestDiaryImport";

const mocks = vi.hoisted(() => ({
  exists: vi.fn(),
  add: vi.fn(),
  upload: vi.fn(),
}));
vi.mock("@/firebase/firebase", () => ({ auth: { currentUser: null } }));
vi.mock("@/lib/service/diaryClient", () => ({
  DiaryClient: { exists: mocks.exists, addIfAbsent: mocks.add },
}));
vi.mock("@/lib/service/diaryImageClient", () => ({
  DiaryImageClient: { upload: mocks.upload },
}));

const record = (): GuestDiaryRecord => ({
  version: 1,
  draft: {
    content: "公園を散歩した",
    tags: [],
    date: "2026-10-03T00:00:00+09:00",
  },
  diary: {
    content: "公園を散歩した",
    tags: [],
    date: "2026-10-03T00:00:00+09:00",
    id: "diary-00000000-0000-4000-8000-000000000001",
    title: "🌳公園の散歩",
    createdAt: "2026-10-03T01:00:00Z",
    imageId: "diary-image-00000000-0000-4000-8000-000000000002",
    image: new Blob(["image"], { type: "image/png" }),
  },
});

beforeEach(async () => {
  let queue = Promise.resolve();
  vi.stubGlobal("navigator", {
    locks: {
      request: (_name: string, operation: () => Promise<unknown>) => {
        const result = queue.then(operation);
        queue = result.then(
          () => undefined,
          () => undefined,
        );
        return result;
      },
    },
  });
  mocks.exists.mockReset().mockResolvedValue(false);
  mocks.add.mockReset().mockResolvedValue(undefined);
  mocks.upload.mockReset().mockResolvedValue({
    id: record().diary!.imageId,
    storagePath: "users/user-1/diaries/image.png",
  });
  await GuestDiaryClient.clear();
});

describe("importGuestDiary", () => {
  it("ログインした本人の日記と画像を保存して成功後に端末データを削除する", async () => {
    await GuestDiaryClient.write(record());
    await expect(importGuestDiary("user-1", () => "user-1")).resolves.toBe(
      record().draft.date,
    );
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "user-1",
        diaryId: record().diary!.id,
        imageId: record().diary!.imageId,
      }),
    );
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "user-1",
        content: "公園を散歩した",
        title: "🌳公園の散歩",
        date: new Date(record().draft.date),
      }),
    );
    expect(await GuestDiaryClient.load()).toBeNull();
  });

  it("画像アップロード失敗では本文と画像と登録先UIDを保持する", async () => {
    await GuestDiaryClient.write(record());
    mocks.upload.mockRejectedValueOnce(new Error("offline"));
    await expect(importGuestDiary("user-1", () => "user-1")).rejects.toThrow(
      "offline",
    );
    const saved = await GuestDiaryClient.load();
    expect(saved?.diary?.targetUid).toBe("user-1");
    expect(await saved?.diary?.image?.text()).toBe("image");
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("Firestore保存失敗の再試行では同じ画像IDと日記IDを使う", async () => {
    await GuestDiaryClient.write(record());
    mocks.add.mockRejectedValueOnce(new Error("offline"));
    await expect(importGuestDiary("user-1", () => "user-1")).rejects.toThrow();
    await importGuestDiary("user-1", () => "user-1");
    expect(mocks.upload.mock.calls[0][0].imageId).toBe(
      mocks.upload.mock.calls[1][0].imageId,
    );
    expect(mocks.add.mock.calls[0][0].id).toBe(mocks.add.mock.calls[1][0].id);
  });

  it("クラウド保存後に端末削除だけ失敗しても再試行では再アップロードしない", async () => {
    await GuestDiaryClient.write(record());
    vi.spyOn(GuestDiaryClient, "clear").mockRejectedValueOnce(
      new Error("local failure"),
    );
    await expect(importGuestDiary("user-1", () => "user-1")).rejects.toThrow(
      "local failure",
    );
    mocks.exists.mockResolvedValue(true);
    await importGuestDiary("user-1", () => "user-1");
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(await GuestDiaryClient.load()).toBeNull();
  });

  it("保存途中に認証が変わるとFirestore登録と端末削除を行わない", async () => {
    await GuestDiaryClient.write(record());
    let uid = "user-1";
    mocks.upload.mockImplementationOnce(async () => {
      uid = "user-2";
      return {};
    });
    await expect(importGuestDiary("user-1", () => uid)).rejects.toThrow(
      "ログイン状態",
    );
    expect(mocks.add).not.toHaveBeenCalled();
    expect((await GuestDiaryClient.load())?.diary?.targetUid).toBe("user-1");
  });

  it("登録先を固定した日記は別のアカウントへ保存しない", async () => {
    const saved = record();
    saved.diary!.targetUid = "user-1";
    await GuestDiaryClient.write(saved);
    await expect(importGuestDiary("user-2", () => "user-2")).rejects.toThrow(
      "別のアカウント",
    );
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
    expect(await GuestDiaryClient.load()).not.toBeNull();
  });

  it("同時に引き継ぎを開始してもクラウド登録は一度だけ行う", async () => {
    await GuestDiaryClient.write(record());
    const dates = await Promise.all([
      importGuestDiary("user-1", () => "user-1"),
      importGuestDiary("user-1", () => "user-1"),
    ]);
    expect(dates).toEqual([record().draft.date, record().draft.date]);
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.add).toHaveBeenCalledTimes(1);
  });

  it("別タブが生成中にログインしても生成完了を待って引き継ぐ", async () => {
    let release!: () => void;
    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });
    const creating = GuestDiaryClient.exclusive(async () => {
      await wait;
      await GuestDiaryClient.write(record());
    });
    const importing = importGuestDiary("user-1", () => "user-1");
    release();
    await creating;
    await expect(importing).resolves.toBe(record().draft.date);
    expect(mocks.add).toHaveBeenCalledTimes(1);
  });

  it("下書きのみの場合はクラウドに登録せず端末に残す", async () => {
    await GuestDiaryClient.saveDraft(record().draft);
    await expect(
      importGuestDiary("user-1", () => "user-1"),
    ).resolves.toBeNull();
    expect(mocks.add).not.toHaveBeenCalled();
    expect((await GuestDiaryClient.load())?.draft.content).toBe(
      "公園を散歩した",
    );
  });
});
