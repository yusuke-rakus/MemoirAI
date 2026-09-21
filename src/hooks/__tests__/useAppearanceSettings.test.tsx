import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  defaultLocalUser,
  useLocalUser,
  UserProvider,
} from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";

import { usePrimaryColor } from "../usePrimaryColor";
import { useTheme } from "../useTheme";

vi.mock("@/lib/service/userSettingsClient", () => ({
  UserSettingsClient: { update: vi.fn() },
}));
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn() }),
}));

const renderSettings = () =>
  renderHook(
    () => {
      const context = useLocalUser();
      return {
        ...context,
        theme: useTheme(),
        color: usePrimaryColor(context.localUser.uid),
      };
    },
    { wrapper: UserProvider },
  );

beforeEach(() => {
  vi.mocked(UserSettingsClient.update).mockResolvedValue(undefined);
});

describe("appearance settings", () => {
  it("取得した設定を共有状態から読み、変更を保存して他のconsumerにも反映する", async () => {
    const { result } = renderSettings();
    act(() =>
      result.current.setLocalUser({
        ...defaultLocalUser,
        uid: "user-1",
        theme: "dark",
        primaryColor: "blue",
      }),
    );
    expect(result.current.theme.theme).toBe("dark");
    expect(result.current.color.primaryColor).toBe("blue");
    await act(async () => {
      await result.current.theme.setTheme("light");
    });
    await act(async () => {
      await result.current.color.handlePrimaryColorChange("green");
    });
    expect(result.current.localUser).toMatchObject({
      theme: "light",
      primaryColor: "green",
    });
    expect(UserSettingsClient.update).toHaveBeenCalledWith("user-1", {
      theme: "light",
      updatedAt: expect.any(Date),
    });
    expect(UserSettingsClient.update).toHaveBeenCalledWith("user-1", {
      primaryColor: "green",
      updatedAt: expect.any(Date),
    });
  });

  it("保存失敗時は設定を戻し、失敗を通知する", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(UserSettingsClient.update).mockRejectedValue(
      new Error("offline"),
    );
    const { result } = renderSettings();
    act(() =>
      result.current.setLocalUser({
        ...defaultLocalUser,
        uid: "user-1",
        theme: "dark",
        primaryColor: "blue",
      }),
    );
    await act(async () => {
      expect(await result.current.theme.setTheme("light")).toBe(false);
    });
    await act(async () => {
      await result.current.color.handlePrimaryColorChange("green");
    });
    expect(result.current.localUser).toMatchObject({
      theme: "dark",
      primaryColor: "blue",
    });
    expect(toast.error).toHaveBeenCalledWith("テーマ設定の保存に失敗しました");
    expect(toast.error).toHaveBeenCalledWith("カラー設定の保存に失敗しました");
  });

  it("保存中にユーザーが切り替わった場合、古い失敗で新しい設定を上書きしない", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let rejectSave: (error: Error) => void = () => undefined;
    vi.mocked(UserSettingsClient.update).mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectSave = reject;
        }),
    );
    const { result } = renderSettings();
    act(() =>
      result.current.setLocalUser({ ...defaultLocalUser, uid: "user-1" }),
    );
    let save: Promise<boolean | undefined>;
    act(() => {
      save = result.current.theme.setTheme("light");
    });
    act(() =>
      result.current.setLocalUser({
        ...defaultLocalUser,
        uid: "user-2",
        theme: "dark",
      }),
    );
    await act(async () => {
      rejectSave(new Error("offline"));
      await save;
    });
    expect(result.current.localUser).toMatchObject({
      uid: "user-2",
      theme: "dark",
    });
  });
});
