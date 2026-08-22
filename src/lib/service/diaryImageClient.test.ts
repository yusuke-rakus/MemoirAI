import {
  DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES,
  DIARY_IMAGE_TARGET_MAX_BYTES,
} from "@/constants/diaryImages";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
let encodedContentType = "image/webp";
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
    queueMicrotask(() => this.onload?.());
  }
}

const createImageFile = (
  size: number,
  type = "image/jpeg",
  name = "photo.jpg",
) => new File([new Uint8Array(size)], name, { type });

beforeEach(() => {
  imageDimensions = { width: 1200, height: 900 };
  encodedContentType = "image/webp";
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
    () =>
      ({
        drawImage: drawImageMock,
      }) as unknown as GPUCanvasContext,
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
        : new Blob([new Uint8Array(size)], { type: encodedContentType }),
    );
  });

  storageMocks.ref.mockImplementation((_storage, path) => ({ path }));
  storageMocks.uploadBytes.mockResolvedValue({});
  storageMocks.getDownloadURL.mockResolvedValue("https://memoir.test/image-1");
});

describe("DiaryImageClient.upload", () => {
  it("700KiB以下かつ長辺1600px以下の画像は変換しない", async () => {
    const file = createImageFile(DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES);

    const image = await DiaryImageClient.upload({
      uid: "user-1",
      diaryId: "diary-1",
      file,
    });

    expect(storageMocks.uploadBytes).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "users/user-1/diaries/diary-1/images/image-1.jpg",
      }),
      file,
      {
        contentType: "image/jpeg",
        customMetadata: { originalName: "photo.jpg" },
      },
    );
    expect(HTMLCanvasElement.prototype.toBlob).not.toHaveBeenCalled();
    expect(image).toMatchObject({
      width: 1200,
      height: 900,
      contentType: "image/jpeg",
    });
  });

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

  it("WebPへエンコードできない場合はアップロードしない", async () => {
    const file = createImageFile(DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES + 1);
    encodedContentType = "image/png";

    await expect(
      DiaryImageClient.upload({
        uid: "user-1",
        diaryId: "diary-1",
        file,
      }),
    ).rejects.toThrowError("WebP encoding is not supported");
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
