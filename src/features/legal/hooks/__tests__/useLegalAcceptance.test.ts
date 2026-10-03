import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLegalAcceptance } from "../useLegalAcceptance";

const mocks = vi.hoisted(() => ({ get: vi.fn(), accept: vi.fn() }));
vi.mock("@/lib/service/legalAcceptanceClient", () => ({
  LegalAcceptanceClient: { getCurrent: mocks.get, acceptCurrent: mocks.accept },
}));
vi.mock("@/features/legal/constants/legalDocuments", () => ({
  LEGAL_DOCUMENT_VERSIONS: {},
  REQUIRED_LEGAL_CONSENT_VERSION: "v1",
}));

beforeEach(() => {
  mocks.get.mockReset();
  mocks.accept.mockReset();
});

describe("useLegalAcceptance ownership", () => {
  it("アカウント変更後は新UIDの確認前に前ユーザーの同意済み状態を返さない", async () => {
    let resolve!: (value: null) => void;
    mocks.get.mockImplementation((uid: string) =>
      uid === "owner-a"
        ? Promise.resolve({})
        : new Promise<null>((finish) => {
            resolve = finish;
          }),
    );
    const seen: string[] = [];
    const { result, rerender } = renderHook(
      ({ uid }) => {
        const acceptance = useLegalAcceptance(uid);
        if (uid === "owner-b") seen.push(acceptance.status);
        return acceptance;
      },
      { initialProps: { uid: "owner-a" } },
    );
    await waitFor(() => expect(result.current.status).toBe("accepted"));
    rerender({ uid: "owner-b" });
    expect(seen).not.toContain("accepted");
    await act(async () => resolve(null));
    expect(result.current.status).toBe("required");
  });

  it("前UIDの同意保存が遅れて完了しても現在UIDの同意状態を変更しない", async () => {
    let resolve!: () => void;
    mocks.get.mockImplementation((uid: string) =>
      Promise.resolve(uid === "owner-a" ? null : {}),
    );
    mocks.accept.mockImplementation(
      () =>
        new Promise<void>((finish) => {
          resolve = finish;
        }),
    );
    const { result, rerender } = renderHook(
      ({ uid }) => useLegalAcceptance(uid),
      { initialProps: { uid: "owner-a" } },
    );
    await waitFor(() => expect(result.current.status).toBe("required"));
    let accepting!: Promise<void>;
    act(() => {
      accepting = result.current.accept();
    });
    rerender({ uid: "owner-b" });
    await waitFor(() => expect(result.current.status).toBe("accepted"));
    await act(async () => {
      resolve();
      await accepting;
    });
    expect(result.current.status).toBe("accepted");
  });
});
