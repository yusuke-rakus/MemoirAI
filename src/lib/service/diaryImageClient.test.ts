import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES,
  DIARY_IMAGE_TARGET_MAX_BYTES,
} from "@/constants/diaryImages";

import { DiaryImageClient } from "./diaryImageClient";

const storageMocks = vi.hoisted(() => ({
  deleteObject: vi.fn(),
  getDownloadURL: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  storage: { name: "test-storage" },
}));

vi.mock("@/lib/generateId", () => ({
  generateDiaryImageId: () => "image-1",
}));

vi.mock("firebase/storage", () => ({
  deleteObject: storageMocks.deleteObject,
  getDownloadURL: storageMocks.getDownloadURL,
  ref: storageMocks.ref,
  uploadBytes: storageMocks.uploadBytes,
}));

type BlobSizeResolver = (
  quality: number,
  width: number,
  height: number,
) => number | null;

let imageDimensions = { width: 1200, height: 900 };
let encodedContentType: string | null = null;
let webpSupported = true;
let loadFails = false;
const canvases: HTMLCanvasElement[] = [];
const fillRectMock = vi.fn();
let blobSizeResolver: BlobSizeResolver = () => 400 * 1024;
const drawImageMock = vi.fn();
const createObjectURLMock = vi.fn(() => "blob:test-image");
const revokeObjectURLMock = vi.fn();

class MockImage {
  naturalWidth = imageDimensions.width;
  naturalHeight = imageDimensions.height;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    queueMicrotask(() => (loadFails ? this.onerror?.() : this.onload?.()));
  }
}

const createImageFile = (
  size: number,
  type = "image/jpeg",
  name = "photo.jpg",
) => new File([new Uint8Array(size)], name, { type });

beforeEach(() => {
  imageDimensions = { width: 1200, height: 900 };
  encodedContentType = null;
  webpSupported = true;
  loadFails = false;
  canvases.length = 0;
  fillRectMock.mockReset();
  blobSizeResolver = () => 400 * 1024;
  drawImageMock.mockReset();
  createObjectURLMock.mockReset().mockReturnValue("blob:test-image");
  revokeObjectURLMock.mockReset();

  Object.defineProperties(URL, {
    createObjectURL: {
      configurable: true,
      value: createObjectURLMock,
    },
    revokeObjectURL: {
      configurable: true,
      value: revokeObjectURLMock,
    },
  });
  vi.stubGlobal("Image", MockImage);

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      canvases.push(this);
      return {
        drawImage: drawImageMock,
        fillRect: fillRectMock,
        fillStyle: "",
      } as unknown as GPUCanvasContext;
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    callback,
    _type,
    quality,
  ) {
    const size = blobSizeResolver(Number(quality), this.width, this.height);
    callback(
      size === null
        ? null
        : new Blob([new Uint8Array(size)], {
            type:
              encodedContentType ??
              (!webpSupported && _type === "image/webp" ? "image/png" : _type),
          }),
    );
  });

  storageMocks.ref.mockImplementation((_storage, path) => ({ path }));
  storageMocks.uploadBytes.mockResolvedValue({});
  storageMocks.getDownloadURL.mockResolvedValue("https://memoir.test/image-1");
});

afterEach(() => {
  for (const canvas of canvases) {
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  }
  if (createObjectURLMock.mock.calls.length) {
    expect(revokeObjectURLMock).toHaveBeenCalledExactlyOnceWith(
      "blob:test-image",
    );
  }
});

describe("DiaryImageClient.upload", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])(
    "700KiB以下かつ長辺1600px以下の%sは変換しない",
    async (type) => {
      const file = createImageFile(DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES, type);

      const image = await DiaryImageClient.upload({
        uid: "user-1",
        diaryId: "diary-1",
        file,
      });

      expect(storageMocks.uploadBytes).toHaveBeenCalledWith(
        expect.objectContaining({
          path: `users/user-1/diaries/diary-1/images/image-1.${type === "image/jpeg" ? "jpg" : type.split("/")[1]}`,
        }),
        file,
        {
          contentType: type,
          customMetadata: { originalName: "photo.jpg" },
        },
      );
      expect(HTMLCanvasElement.prototype.toBlob).not.toHaveBeenCalled();
      expect(image).toMatchObject({
        width: 1200,
        height: 900,
        contentType: type,
      });
    },
  );

  it("700KiB超の画像を最も高い品質の500KiB以下のWebPにする", async () => {
    const file = createImageFile(DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES + 1);
    blobSizeResolver = (quality) => Math.round((100 + quality * 500) * 1024);

    const image = await DiaryImageClient.upload({
      uid: "user-1",
      diaryId: "diary-1",
      file,
    });

    const uploadedBlob = storageMocks.uploadBytes.mock.calls[0][1] as Blob;
    expect(uploadedBlob.size).toBeLessThanOrEqual(DIARY_IMAGE_TARGET_MAX_BYTES);
    expect(uploadedBlob.size).toBeGreaterThanOrEqual(300 * 1024);
    expect(uploadedBlob.type).toBe("image/webp");
    expect(storageMocks.uploadBytes).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "users/user-1/diaries/diary-1/images/image-1.webp",
      }),
      uploadedBlob,
      expect.objectContaining({ contentType: "image/webp" }),
    );
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledTimes(7);
    expect(image.contentType).toBe("image/webp");
  });

  it("長辺1600px超の小容量画像も縮小する", async () => {
    imageDimensions = { width: 2400, height: 1800 };
    const file = createImageFile(200 * 1024);

    const image = await DiaryImageClient.upload({
      uid: "user-1",
      diaryId: "diary-1",
      file,
    });

    expect(drawImageMock).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      1600,
      1200,
    );
    expect(image).toMatchObject({
      width: 1600,
      height: 1200,
      contentType: "image/webp",
    });
  });

  it("最低品質でも500KiBを超える場合は解像度を下げる", async () => {
    imageDimensions = { width: 2400, height: 1800 };
    const file = createImageFile(DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES + 1);
    blobSizeResolver = (_quality, width) =>
      width === 1600 ? 700 * 1024 : 450 * 1024;

    const image = await DiaryImageClient.upload({
      uid: "user-1",
      diaryId: "diary-1",
      file,
    });

    expect(image.width).toBeLessThan(1600);
    expect(image.height).toBeLessThan(1200);
    expect(image.contentType).toBe("image/webp");
    const uploadedBlob = storageMocks.uploadBytes.mock.calls[0][1] as Blob;
    expect(uploadedBlob.size).toBe(450 * 1024);
  });

  it("小容量のHEICもStorage互換のWebPへ変換する", async () => {
    const file = createImageFile(200 * 1024, "image/heic", "photo.heic");

    const image = await DiaryImageClient.upload({
      uid: "user-1",
      diaryId: "diary-1",
      file,
    });

    expect(storageMocks.uploadBytes).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "users/user-1/diaries/diary-1/images/image-1.webp",
      }),
      expect.objectContaining({ type: "image/webp" }),
      expect.objectContaining({ contentType: "image/webp" }),
    );
    expect(image.contentType).toBe("image/webp");
  });

  it("JPEGも出力形式が一致しない場合はアップロードしない", async () => {
    const file = createImageFile(DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES + 1);
    encodedContentType = "image/png";

    await expect(
      DiaryImageClient.upload({
        uid: "user-1",
        diaryId: "diary-1",
        file,
      }),
    ).rejects.toMatchObject({
      code: "conversion-failed",
      cause: expect.any(Error),
    });
    expect(storageMocks.uploadBytes).not.toHaveBeenCalled();
  });

  it("最小解像度でも500KiBを超える場合はアップロードしない", async () => {
    imageDimensions = { width: 320, height: 240 };
    const file = createImageFile(DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES + 1);
    blobSizeResolver = () => 600 * 1024;

    await expect(
      DiaryImageClient.upload({
        uid: "user-1",
        diaryId: "diary-1",
        file,
      }),
    ).rejects.toThrowError("Failed to compress image below the size limit");
    expect(storageMocks.uploadBytes).not.toHaveBeenCalled();
  });

  it("非対応MIMEを画像処理前に拒否する", async () => {
    const file = createImageFile(100 * 1024, "image/gif", "photo.gif");

    await expect(
      DiaryImageClient.upload({
        uid: "user-1",
        diaryId: "diary-1",
        file,
      }),
    ).rejects.toThrowError("Unsupported image type");
    expect(createObjectURLMock).not.toHaveBeenCalled();
    expect(storageMocks.uploadBytes).not.toHaveBeenCalled();
  });
});

const uploadFile = (file: File) =>
  DiaryImageClient.upload({ uid: "user-1", diaryId: "diary-1", file });

describe("ブラウザの画像変換互換性", () => {
  it.each(
    ["image/heic", "image/heif"].flatMap((type) =>
      [200 * 1024, 701 * 1024, 10 * 1024 * 1024, 11 * 1024 * 1024].flatMap(
        (size) => [true, false].map((supported) => ({ type, size, supported })),
      ),
    ),
  )("$type $size bytes WebP=$supported", async ({ type, size, supported }) => {
    webpSupported = supported;
    const file = createImageFile(size, type, "photo.heic");
    const result = await uploadFile(file);
    const contentType = supported ? "image/webp" : "image/jpeg";
    const blob = storageMocks.uploadBytes.mock.calls[0][1] as Blob;
    expect(blob.type).toBe(contentType);
    expect(blob.size).toBeLessThanOrEqual(DIARY_IMAGE_TARGET_MAX_BYTES);
    expect(result.contentType).toBe(contentType);
    expect(result.storagePath).toBe(
      `users/user-1/diaries/diary-1/images/image-1.${supported ? "webp" : "jpg"}`,
    );
    expect(storageMocks.uploadBytes.mock.calls[0][2]).toEqual({
      contentType,
      customMetadata: { originalName: file.name },
    });
    if (!supported) {
      expect(fillRectMock).toHaveBeenCalledWith(0, 0, 1200, 900);
      expect(fillRectMock.mock.invocationCallOrder[0]).toBeLessThan(
        drawImageMock.mock.invocationCallOrder[1],
      );
      const contexts = vi.mocked(HTMLCanvasElement.prototype.getContext).mock
        .results;
      expect(contexts[1].value.fillStyle).toBe("#ffffff");
    } else {
      expect(fillRectMock).not.toHaveBeenCalled();
    }
  });

  it.each(["image/jpeg", "image/png", "image/webp"])(
    "大容量%sをJPEGで品質探索する",
    async (type) => {
      webpSupported = false;
      blobSizeResolver = (quality) => Math.round((100 + quality * 500) * 1024);
      await uploadFile(createImageFile(701 * 1024, type));
      const blob = storageMocks.uploadBytes.mock.calls[0][1] as Blob;
      expect(blob.type).toBe("image/jpeg");
      expect(blob.size).toBeLessThanOrEqual(DIARY_IMAGE_TARGET_MAX_BYTES);
      expect(blob.size).toBeGreaterThan(490 * 1024);
      const types = vi
        .mocked(HTMLCanvasElement.prototype.toBlob)
        .mock.calls.map((call) => call[1]);
      expect(types).toEqual(["image/webp", ...Array(7).fill("image/jpeg")]);
    },
  );

  it("JPEGで解像度を下げ、WebPを再試行しない", async () => {
    webpSupported = false;
    imageDimensions = { width: 2400, height: 1800 };
    blobSizeResolver = (_quality, width) =>
      width === 1600 ? 700 * 1024 : 450 * 1024;
    const result = await uploadFile(createImageFile(200 * 1024, "image/heic"));
    expect(result.width).toBeLessThan(1600);
    expect(result.contentType).toBe("image/jpeg");
    expect(
      vi
        .mocked(HTMLCanvasElement.prototype.toBlob)
        .mock.calls.filter((call) => call[1] === "image/webp"),
    ).toHaveLength(1);
  });

  it("JPEGでも下限解像度で収まらなければ送信しない", async () => {
    webpSupported = false;
    imageDimensions = { width: 320, height: 240 };
    blobSizeResolver = () => 600 * 1024;
    await expect(
      uploadFile(createImageFile(200 * 1024, "image/heic")),
    ).rejects.toMatchObject({ code: "size-limit" });
    expect(storageMocks.uploadBytes).not.toHaveBeenCalled();
  });

  it.each(["image/heic", "image/heif", "image/jpeg"])(
    "%s読込失敗を区別する",
    async (type) => {
      loadFails = true;
      await expect(
        uploadFile(createImageFile(200 * 1024, type)),
      ).rejects.toMatchObject({
        code: "load-failed",
        contentType: type,
        cause: expect.any(Error),
      });
      expect(storageMocks.uploadBytes).not.toHaveBeenCalled();
    },
  );

  it.each(["context", "draw", "null", "throw"])(
    "Canvas失敗: %s",
    async (failure) => {
      if (failure === "context")
        vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(
          function (this: HTMLCanvasElement) {
            canvases.push(this);
            return null;
          },
        );
      if (failure === "draw")
        drawImageMock.mockImplementation(() => {
          throw new Error("draw failed");
        });
      if (failure === "null") blobSizeResolver = () => null;
      if (failure === "throw")
        vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(() => {
          throw new Error("encode failed");
        });
      await expect(
        uploadFile(createImageFile(200 * 1024, "image/heic")),
      ).rejects.toMatchObject({
        code: "conversion-failed",
        cause: expect.any(Error),
      });
      expect(storageMocks.uploadBytes).not.toHaveBeenCalled();
    },
  );

  it.each([true, false])(
    "非同期変換完了までURLを保持する: 成功=%s",
    async (success) => {
      let finish!: BlobCallback;
      vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(
        (callback) => {
          finish = callback;
        },
      );
      const promise = uploadFile(createImageFile(200 * 1024, "image/heic"));
      await vi.waitFor(() => expect(finish).toBeDefined());
      expect(revokeObjectURLMock).not.toHaveBeenCalled();
      expect(canvases[0].width).toBe(1200);
      finish(success ? new Blob(["image"], { type: "image/webp" }) : null);
      if (success) await promise;
      else
        await expect(promise).rejects.toMatchObject({
          code: "conversion-failed",
        });
    },
  );
});
