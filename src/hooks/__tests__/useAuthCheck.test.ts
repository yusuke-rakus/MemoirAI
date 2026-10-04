import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthCheck } from "../useAuthCheck";

const mocks = vi.hoisted(() => ({
  listener: undefined as undefined | ((user: User | null) => Promise<void>),
  auth: {},
  settings: vi.fn(),
  profile: vi.fn(),
  setUser: vi.fn(),
}));
vi.mock("firebase/auth", () => ({
  getAuth: () => mocks.auth,
  onAuthStateChanged: (
    _auth: unknown,
    listener: (user: User | null) => Promise<void>,
  ) => {
    mocks.listener = listener;
    return () => undefined;
  },
}));
vi.mock("@/contexts/LocalUserContext", () => ({
  defaultLocalUser: { uid: "" },
  useLocalUser: () => ({ setLocalUser: mocks.setUser }),
}));
vi.mock("@/lib/service/userSettingsClient", () => ({
  UserSettingsClient: { getByUid: mocks.settings },
}));
vi.mock("@/lib/service/userProfileClient", () => ({
  UserProfileClient: { getByUid: mocks.profile },
}));

beforeEach(() => {
  mocks.settings.mockReset();
  mocks.profile.mockResolvedValue(null);
});

describe("useAuthCheck session races", () => {
  it("前アカウントの設定取得が遅れて完了しても現在のユーザーを戻さない", async () => {
    let finish!: (value: null) => void;
    mocks.settings.mockImplementation((uid: string) =>
      uid === "owner-a"
        ? new Promise<null>((resolve) => {
            finish = resolve;
          })
        : Promise.resolve(null),
    );
    const { result } = renderHook(() => useAuthCheck());
    let previous!: Promise<void>;
    act(() => {
      previous = mocks.listener!({ uid: "owner-a" } as User);
    });
    await act(async () => {
      await mocks.listener!({ uid: "owner-b" } as User);
    });
    await act(async () => {
      finish(null);
      await previous;
    });
    expect(result.current.user?.uid).toBe("owner-b");
    expect(mocks.setUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ uid: "owner-b" }),
    );
  });

  it("ログアウト後は完了した古い認証処理でユーザーを復元しない", async () => {
    let finish!: (value: null) => void;
    mocks.settings.mockImplementation(
      () =>
        new Promise<null>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() => useAuthCheck());
    let previous!: Promise<void>;
    act(() => {
      previous = mocks.listener!({ uid: "owner-a" } as User);
    });
    await act(async () => {
      await mocks.listener!(null);
    });
    await act(async () => {
      finish(null);
      await previous;
    });
    expect(result.current.user).toBeNull();
    expect(mocks.setUser).toHaveBeenLastCalledWith({ uid: "" });
  });
});
