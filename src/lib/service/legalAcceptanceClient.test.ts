import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEGAL_DOCUMENT_VERSIONS } from "@/features/legal/constants/legalDocuments";
import { LegalAcceptanceClient } from "./legalAcceptanceClient";

const firestoreMocks = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  db: { name: "test-db" },
}));

vi.mock("firebase/firestore", () => ({
  doc: firestoreMocks.doc,
  getDoc: firestoreMocks.getDoc,
  serverTimestamp: firestoreMocks.serverTimestamp,
  setDoc: firestoreMocks.setDoc,
}));

const acceptedAt = { toDate: () => new Date("2026-08-22T00:00:00Z") };

beforeEach(() => {
  firestoreMocks.doc.mockImplementation((_db, ...segments) => ({ segments }));
  firestoreMocks.serverTimestamp.mockReturnValue("server-timestamp");
});

describe("LegalAcceptanceClient", () => {
  it("現在versionの記録がなければnullを返す", async () => {
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false });

    await expect(
      LegalAcceptanceClient.getCurrent("user-1"),
    ).resolves.toBeNull();

    expect(firestoreMocks.doc).toHaveBeenCalledWith(
      { name: "test-db" },
      "users",
      "user-1",
      "legalAcceptances",
      "v1",
    );
  });

  it("有効な現在versionの記録を返す", async () => {
    const acceptance = {
      uid: "user-1",
      requiredConsentVersion: "v1",
      documentVersions: LEGAL_DOCUMENT_VERSIONS,
      confirmedAdult: true,
      acceptanceMethod: "single-checkbox",
      locale: "ja-JP",
      acceptedAt,
    };
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => acceptance,
    });

    await expect(LegalAcceptanceClient.getCurrent("user-1")).resolves.toEqual(
      acceptance,
    );
  });

  it("成人確認が未完了の記録は未同意として扱う", async () => {
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        uid: "user-1",
        requiredConsentVersion: "v1",
        documentVersions: LEGAL_DOCUMENT_VERSIONS,
        confirmedAdult: false,
        acceptanceMethod: "single-checkbox",
        locale: "ja-JP",
        acceptedAt,
      }),
    });

    await expect(
      LegalAcceptanceClient.getCurrent("user-1"),
    ).resolves.toBeNull();
  });

  it("不正な記録は同意済みとして扱わない", async () => {
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: "user-1" }),
    });

    await expect(
      LegalAcceptanceClient.getCurrent("user-1"),
    ).rejects.toThrowError("Stored legal acceptance is invalid.");
  });

  it("現在の文書versionとserver timestampを保存する", async () => {
    await LegalAcceptanceClient.acceptCurrent("user-1");

    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        segments: ["users", "user-1", "legalAcceptances", "v1"],
      }),
      {
        uid: "user-1",
        requiredConsentVersion: "v1",
        documentVersions: LEGAL_DOCUMENT_VERSIONS,
        confirmedAdult: true,
        acceptanceMethod: "single-checkbox",
        locale: "ja-JP",
        acceptedAt: "server-timestamp",
      },
    );
  });
});
