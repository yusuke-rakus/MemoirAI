import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGoogleLogin } from "../useGoogleLogin";

const mocks = vi.hoisted(() => ({
  auth: {},
  provider: {},
  signIn: vi.fn(),
  toast: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  auth: mocks.auth,
  provider: mocks.provider,
  signInWithPopup: mocks.signIn,
}));
vi.mock("sonner", () => ({
  toast: Object.assign(mocks.toast, { error: mocks.error }),
}));

beforeEach(() => {
  mocks.signIn.mockReset().mockResolvedValue({ user: { displayName: "太郎" } });
  mocks.toast.mockClear();
  mocks.error.mockClear();
});

describe("useGoogleLogin", () => {
  it("Google認証に成功すると成功結果を返しユーザーを通知する", async () => {
    const { result } = renderHook(() => useGoogleLogin());
    await act(async () => {
      expect(await result.current.login()).toBe(true);
    });
    expect(mocks.signIn).toHaveBeenCalledWith(mocks.auth, mocks.provider);
    expect(mocks.toast).toHaveBeenCalledWith("太郎さん、ようこそ🎉");
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it("認証中に重複して呼ばれてもポップアップは一度だけ開始する", async () => {
    let resolve!: (value: { user: { displayName: string } }) => void;
    mocks.signIn.mockImplementationOnce(
      () => new Promise((done) => (resolve = done)),
    );
    const { result } = renderHook(() => useGoogleLogin());
    await act(async () => {
      const first = result.current.login();
      expect(await result.current.login()).toBe(false);
      expect(mocks.signIn).toHaveBeenCalledTimes(1);
      resolve({ user: { displayName: "太郎" } });
      expect(await first).toBe(true);
    });
  });

  it("認証がキャンセルされた場合は失敗を通知し次の認証を再試行できる", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.signIn.mockRejectedValueOnce({ code: "auth/popup-closed-by-user" });
    const { result } = renderHook(() => useGoogleLogin());
    await act(async () => {
      expect(await result.current.login()).toBe(false);
    });
    expect(mocks.error).toHaveBeenCalledWith(
      "Googleでのログインに失敗しました",
    );
    await act(async () => {
      expect(await result.current.login()).toBe(true);
    });
    expect(mocks.signIn).toHaveBeenCalledTimes(2);
  });
});
