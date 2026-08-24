import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActiveUserMemoryContext } from "@/types/memory";
import { useCreateDiary } from "./useCreateDiary";

const mocks = vi.hoisted(() => ({
  cards: [] as Array<{
    id: string;
    title: string;
    body: string;
    tags: Array<{ name: string; color: "default" }>;
    images: Array<{ id: string; file: File; previewUrl: string }>;
    date: Date;
    isCollapsed: boolean;
    isRemoving: boolean;
  }>,
  add: vi.fn(),
  upload: vi.fn(),
  deleteMany: vi.fn(),
  generateIllustration: vi.fn(),
  generateTitle: vi.fn(),
  extractMemory: vi.fn(),
  getMemory: vi.fn(),
  mergeMemory: vi.fn(),
  invalidateSearch: vi.fn(),
  requestRefresh: vi.fn(),
  generateId: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/contexts/LocalUserContext", () => ({
  useLocalUser: () => ({ localUser: { uid: "user-1" } }),
}));

vi.mock("./useDiaryCard", () => ({
  useDiaryCard: () => ({ cards: mocks.cards }),
}));

vi.mock("@/lib/generateId", () => ({
  generateDiaryId: mocks.generateId,
}));

vi.mock("@/firebase/models/createDiarySchema", () => ({
  diaryTitleModel: { generateContent: mocks.generateTitle },
}));

vi.mock("@/firebase/models/memoryExtractionSchema", () => ({
  memoryExtractionModel: { generateContent: mocks.extractMemory },
}));

vi.mock("@/lib/service/diaryClient", () => ({
  DiaryClient: { add: mocks.add },
}));

vi.mock("@/lib/service/diaryImageClient", () => ({
  DiaryImageClient: {
    upload: mocks.upload,
    deleteMany: mocks.deleteMany,
  },
}));

vi.mock("@/lib/service/diaryIllustrationClient", () => ({
  DiaryIllustrationError: class DiaryIllustrationError extends Error {},
  DiaryIllustrationClient: { generate: mocks.generateIllustration },
}));

vi.mock("@/lib/service/userMemoryClient", () => ({
  UserMemoryClient: {
    getActiveMemoryContext: mocks.getMemory,
    mergeExtractedMemory: mocks.mergeMemory,
  },
}));

vi.mock("@/stores/diarySearchStore", () => ({
  invalidateDiarySearchCache: mocks.invalidateSearch,
}));

vi.mock("@/stores/diaryRefreshStore", () => ({
  requestDiaryRefresh: mocks.requestRefresh,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

const createCard = (body: string, files: File[] = []) => ({
  id: `card-${body}`,
  title: "",
  body,
  tags: [{ name: "散歩", color: "default" as const }],
  images: files.map((file, index) => ({
    id: `image-${index}`,
    file,
    previewUrl: `blob:${index}`,
  })),
  date: new Date("2026-08-20T00:00:00+09:00"),
  isCollapsed: false,
  isRemoving: false,
});

const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

const memoryContext: ActiveUserMemoryContext = {
  profileFacts: [
    {
      id: "profile-1",
      key: "location",
      value: "東京で暮らしている",
      confidence: 0.95,
    },
  ],
  preferences: [
    {
      id: "preference-1",
      value: "青色が好き",
      confidence: 0.9,
    },
  ],
  people: [],
};

beforeEach(() => {
  mocks.cards = [];
  Object.values(mocks).forEach((value) => {
    if (typeof value === "function" && "mockReset" in value) {
      value.mockReset();
    }
  });
  let id = 0;
  mocks.generateId.mockImplementation(() => `diary-${++id}`);
  mocks.generateTitle.mockResolvedValue({
    response: { text: () => JSON.stringify({ title: "🌸 春の散歩" }) },
  });
  mocks.extractMemory.mockResolvedValue({
    response: { text: () => JSON.stringify({ facts: [] }) },
  });
  mocks.getMemory.mockResolvedValue(null);
  mocks.mergeMemory.mockResolvedValue(undefined);
  mocks.add.mockResolvedValue(undefined);
  mocks.deleteMany.mockResolvedValue(undefined);
  mocks.upload.mockImplementation(({ file }: { file: File }) =>
    Promise.resolve({
      id: file.name,
      storagePath: `path/${file.name}`,
      downloadURL: `https://example.test/${file.name}`,
      width: 100,
      height: 75,
      contentType: file.type,
    }),
  );
});

describe("useCreateDiary", () => {
  it("通常保存の生成と保存の進行状態を公開する", async () => {
    mocks.cards = [createCard("桜を見ました")];
    const title = createDeferred<{
      response: { text: () => string };
    }>();
    const add = createDeferred<void>();
    mocks.generateTitle.mockReturnValue(title.promise);
    mocks.add.mockReturnValue(add.promise);
    const { result } = renderHook(() => useCreateDiary());
    let savePromise!: Promise<void>;

    await act(async () => {
      savePromise = result.current.onSave("standard");
      await Promise.resolve();
    });

    expect(result.current.creationProgress).toEqual({
      saveMode: "standard",
      metadata: "active",
      illustration: null,
      persistence: "pending",
    });

    title.resolve({
      response: { text: () => JSON.stringify({ title: "🌸 春の散歩" }) },
    });

    await waitFor(() => {
      expect(result.current.creationProgress).toEqual({
        saveMode: "standard",
        metadata: "complete",
        illustration: null,
        persistence: "active",
      });
    });

    add.resolve();
    await act(async () => savePromise);

    expect(result.current.creationProgress).toBeNull();
  });

  it("絵日記の画像が先に完成した場合も工程ごとに完了を反映する", async () => {
    mocks.cards = [createCard("桜を見ました")];
    const title = createDeferred<{
      response: { text: () => string };
    }>();
    const illustration = createDeferred<File>();
    const add = createDeferred<void>();
    mocks.generateTitle.mockReturnValue(title.promise);
    mocks.generateIllustration.mockReturnValue(illustration.promise);
    mocks.add.mockReturnValue(add.promise);
    const { result } = renderHook(() => useCreateDiary());
    let savePromise!: Promise<void>;

    await act(async () => {
      savePromise = result.current.onSave("illustrated");
      await Promise.resolve();
    });

    illustration.resolve(
      new File(["generated"], "generated.png", { type: "image/png" }),
    );

    await waitFor(() => {
      expect(result.current.creationProgress).toMatchObject({
        metadata: "active",
        illustration: "complete",
        persistence: "pending",
      });
    });

    title.resolve({
      response: { text: () => JSON.stringify({ title: "🌸 春の散歩" }) },
    });

    await waitFor(() => {
      expect(result.current.creationProgress).toMatchObject({
        metadata: "complete",
        illustration: "complete",
        persistence: "active",
      });
    });

    add.resolve();
    await act(async () => savePromise);

    expect(result.current.creationProgress).toBeNull();
  });

  it("通常保存では画像生成を呼ばない", async () => {
    mocks.cards = [createCard("桜を見ました"), createCard("本を読みました")];
    const { result } = renderHook(() => useCreateDiary());

    await act(async () => {
      await result.current.onSave("standard");
    });

    expect(mocks.generateIllustration).not.toHaveBeenCalled();
    expect(mocks.add).toHaveBeenCalledTimes(2);
    expect(mocks.toastSuccess).toHaveBeenCalledWith("日記を作成しました🎊");
  });

  it("本文のある各セクションに1枚生成する", async () => {
    mocks.cards = [
      createCard("桜を見ました"),
      createCard("   "),
      createCard("本を読みました"),
    ];
    mocks.generateIllustration.mockResolvedValue(
      new File(["generated"], "generated.png", { type: "image/png" }),
    );
    const { result } = renderHook(() => useCreateDiary());

    await act(async () => {
      await result.current.onSave("illustrated");
    });

    expect(mocks.generateIllustration).toHaveBeenCalledTimes(2);
    expect(mocks.add).toHaveBeenCalledTimes(2);
  });

  it("保存済みメモリを1回取得して各セクションの画像生成へ渡す", async () => {
    mocks.cards = [createCard("桜を見ました"), createCard("本を読みました")];
    mocks.getMemory.mockResolvedValue(memoryContext);
    mocks.generateIllustration.mockResolvedValue(
      new File(["generated"], "generated.png", { type: "image/png" }),
    );
    const { result } = renderHook(() => useCreateDiary());

    await act(async () => {
      await result.current.onSave("illustrated");
    });

    expect(mocks.getMemory).toHaveBeenCalledOnce();
    expect(mocks.generateIllustration).toHaveBeenNthCalledWith(1, {
      content: "桜を見ました",
      tags: ["散歩"],
      memoryContext,
    });
    expect(mocks.generateIllustration).toHaveBeenNthCalledWith(2, {
      content: "本を読みました",
      tags: ["散歩"],
      memoryContext,
    });
  });

  it("メモリ取得失敗時はnullを渡して絵日記保存を続行する", async () => {
    mocks.cards = [createCard("桜を見ました")];
    mocks.getMemory.mockRejectedValue(new Error("memory failed"));
    mocks.generateIllustration.mockResolvedValue(
      new File(["generated"], "generated.png", { type: "image/png" }),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useCreateDiary());

    await act(async () => {
      await result.current.onSave("illustrated");
    });

    expect(mocks.generateIllustration).toHaveBeenCalledWith({
      content: "桜を見ました",
      tags: ["散歩"],
      memoryContext: null,
    });
    expect(mocks.add).toHaveBeenCalledOnce();
  });

  it("生成画像を手動画像より先にアップロードする", async () => {
    const manual = new File(["manual"], "manual.jpg", { type: "image/jpeg" });
    const generated = new File(["generated"], "generated.png", {
      type: "image/png",
    });
    mocks.cards = [createCard("桜を見ました", [manual])];
    mocks.generateIllustration.mockResolvedValue(generated);
    const { result } = renderHook(() => useCreateDiary());

    await act(async () => {
      await result.current.onSave("illustrated");
    });

    expect(mocks.upload).toHaveBeenCalledTimes(2);
    expect(mocks.upload.mock.calls[0]?.[0]).toMatchObject({ file: generated });
    expect(mocks.upload.mock.calls[1]?.[0]).toMatchObject({ file: manual });
    expect(
      mocks.add.mock.calls[0]?.[0].images.map(({ id }: { id: string }) => id),
    ).toEqual(["generated.png", "manual.jpg"]);
  });

  it("手動画像が2枚ある場合はAI・Storage・Firestoreを呼ばない", async () => {
    mocks.cards = [
      createCard("桜を見ました", [
        new File(["1"], "one.jpg", { type: "image/jpeg" }),
        new File(["2"], "two.jpg", { type: "image/jpeg" }),
      ]),
    ];
    const { result } = renderHook(() => useCreateDiary());

    await expect(
      act(async () => {
        await result.current.onSave("illustrated");
      }),
    ).rejects.toThrow("生成画像を追加するには画像を1枚削除してください");

    expect(mocks.generateIllustration).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("生成失敗時はStorage・Firestoreと完了通知を実行しない", async () => {
    mocks.cards = [createCard("桜を見ました")];
    mocks.generateIllustration.mockRejectedValue(
      new Error("generation failed"),
    );
    const { result } = renderHook(() => useCreateDiary());

    await expect(
      act(async () => {
        await result.current.onSave("illustrated");
      }),
    ).rejects.toThrow("generation failed");

    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
    expect(mocks.invalidateSearch).not.toHaveBeenCalled();
    expect(mocks.requestRefresh).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith("日記の作成に失敗しました");
    expect(result.current.creationProgress).toBeNull();
  });

  it("タイトル生成失敗時もStorage・Firestoreを実行しない", async () => {
    mocks.cards = [createCard("桜を見ました")];
    mocks.generateTitle.mockRejectedValue(new Error("title failed"));
    mocks.generateIllustration.mockResolvedValue(
      new File(["generated"], "generated.png", { type: "image/png" }),
    );
    const { result } = renderHook(() => useCreateDiary());

    await expect(
      act(async () => {
        await result.current.onSave("illustrated");
      }),
    ).rejects.toThrow("title failed");

    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
    expect(result.current.creationProgress).toBeNull();
  });

  it("画像アップロード失敗時は保存工程を閉じてFirestoreを実行しない", async () => {
    const manual = new File(["manual"], "manual.jpg", { type: "image/jpeg" });
    mocks.cards = [createCard("桜を見ました", [manual])];
    mocks.upload.mockRejectedValue(new Error("upload failed"));
    const { result } = renderHook(() => useCreateDiary());

    await expect(
      act(async () => {
        await result.current.onSave("standard");
      }),
    ).rejects.toThrow("upload failed");

    expect(mocks.add).not.toHaveBeenCalled();
    expect(result.current.creationProgress).toBeNull();
  });

  it("Firestore保存失敗時は生成画像を含むアップロード済み画像を削除する", async () => {
    const manual = new File(["manual"], "manual.jpg", { type: "image/jpeg" });
    mocks.cards = [createCard("桜を見ました", [manual])];
    mocks.generateIllustration.mockResolvedValue(
      new File(["generated"], "generated.png", { type: "image/png" }),
    );
    mocks.add.mockRejectedValue(new Error("firestore failed"));
    const { result } = renderHook(() => useCreateDiary());

    await expect(
      act(async () => {
        await result.current.onSave("illustrated");
      }),
    ).rejects.toThrow("firestore failed");

    expect(mocks.deleteMany).toHaveBeenCalledWith([
      expect.objectContaining({ id: "generated.png" }),
      expect.objectContaining({ id: "manual.jpg" }),
    ]);
    expect(result.current.creationProgress).toBeNull();
  });
});
