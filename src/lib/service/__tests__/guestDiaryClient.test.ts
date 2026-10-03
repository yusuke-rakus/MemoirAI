// @vitest-environment node
import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { GuestDiaryClient, type GuestDiaryRecord } from "../guestDiaryClient";

const draft = {
  date: "2026-10-03T00:00:00+09:00",
  content: "公園を散歩した",
  tags: [{ name: "散歩", color: "default" }],
};
const record = (): GuestDiaryRecord => ({
  version: 1,
  draft,
  diary: {
    ...draft,
    id: "diary-00000000-0000-4000-8000-000000000001",
    imageId: "diary-image-00000000-0000-4000-8000-000000000002",
    title: "🌳公園の散歩",
    createdAt: "2026-10-03T01:00:00Z",
    image: new Blob(["image"], { type: "image/png" }),
  },
});

beforeEach(async () => {
  vi.stubGlobal("navigator", {
    locks: {
      request: (_name: string, operation: () => Promise<unknown>) =>
        operation(),
    },
  });
  await GuestDiaryClient.clear();
});

describe("GuestDiaryClient", () => {
  it("本文と生成画像を保存すると新たな読み込みでまとめて復元できる", async () => {
    await GuestDiaryClient.write(record());
    const loaded = await GuestDiaryClient.load();
    expect(loaded?.diary?.title).toBe("🌳公園の散歩");
    expect(await loaded?.diary?.image?.text()).toBe("image");
    expect(loaded?.diary?.image?.type).toBe("image/png");
  });

  it("作成結果があると別タブの古い下書きで上書きしない", async () => {
    await GuestDiaryClient.write(record());
    await GuestDiaryClient.saveDraft({ ...draft, content: "古い入力" });
    expect((await GuestDiaryClient.load())?.diary?.content).toBe(draft.content);
  });

  it("不正な日付や生成画像は書き込み前に拒否して既存データを保持する", async () => {
    await GuestDiaryClient.write(record());
    await expect(
      GuestDiaryClient.saveDraft({ ...draft, date: "invalid" }),
    ).rejects.toThrow();
    const invalid = record();
    invalid.diary!.image = new Blob(["text"], { type: "text/plain" });
    await expect(GuestDiaryClient.write(invalid)).rejects.toThrow();
    expect((await GuestDiaryClient.load())?.diary?.title).toBe("🌳公園の散歩");
  });

  it("復元時に破損値を拒否し自動削除しない", async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("memoir-ai-guest-diary", 1);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("diary", "readwrite");
        tx.objectStore("diary").put({ version: 99 }, "current");
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onabort = () => {
          db.close();
          reject(tx.error);
        };
      };
      request.onerror = () => reject(request.error);
    });
    await expect(GuestDiaryClient.load()).rejects.toThrow();
    await expect(GuestDiaryClient.load()).rejects.toThrow();
  });

  it("保存がabortされた場合は成功を返さず以前のデータを保持する", async () => {
    await GuestDiaryClient.write(record());
    const original = IDBObjectStore.prototype.put;
    const spy = vi
      .spyOn(IDBObjectStore.prototype, "put")
      .mockImplementation(function (this: IDBObjectStore, ...args) {
        const request = original.apply(this, args);
        this.transaction.abort();
        return request;
      });
    await expect(
      GuestDiaryClient.write({ version: 1, draft }),
    ).rejects.toThrow();
    spy.mockRestore();
    expect((await GuestDiaryClient.load())?.diary?.title).toBe("🌳公園の散歩");
  });

  it("排他制御が利用できない場合は作成を開始しない", async () => {
    vi.stubGlobal("navigator", {});
    const operation = vi.fn();
    await expect(GuestDiaryClient.exclusive(operation)).rejects.toThrow(
      "最新版",
    );
    expect(operation).not.toHaveBeenCalled();
  });
});
