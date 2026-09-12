import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import { SharedDiariesSettingsSection } from "./SharedDiariesSettingsSection";

vi.mock("@/lib/service/sharedDiaryClient", () => ({
  SharedDiaryClient: {
    getByOwner: vi.fn(),
    unpublish: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const getByOwnerMock = vi.mocked(SharedDiaryClient.getByOwner);
const unpublishMock = vi.mocked(SharedDiaryClient.unpublish);

const diary = {
  id: "diary-1",
  uid: "user-1",
  title: "夏の思い出",
  content: "海へ行きました。",
  tags: [],
  date: { toDate: () => new Date("2026-08-01") },
  createdAt: { toDate: () => new Date("2026-08-01") },
  sharedAt: {
    toDate: () => new Date("2026-08-02"),
    toMillis: () => new Date("2026-08-02").getTime(),
  },
};

describe("SharedDiariesSettingsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("共有した日記がない場合はEmptyを表示する", async () => {
    getByOwnerMock.mockResolvedValue([]);

    render(<SharedDiariesSettingsSection uid="user-1" />);

    expect(
      await screen.findByText("共有した日記はありません"),
    ).toBeInTheDocument();
  });

  it("共有した日記を表示し、確認後に共有を解除する", async () => {
    getByOwnerMock.mockResolvedValue([{ sharedDiaryId: "share-1", diary }]);
    unpublishMock.mockResolvedValue({ wasShared: true });
    const user = userEvent.setup();

    render(<SharedDiariesSettingsSection uid="user-1" />);

    expect(await screen.findByText("夏の思い出")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "解除" }));
    expect(
      screen.getByRole("heading", { name: "共有を解除しますか？" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "共有を解除する" }));

    await waitFor(() => {
      expect(unpublishMock).toHaveBeenCalledWith(diary);
      expect(screen.queryByText("夏の思い出")).not.toBeInTheDocument();
    });
  });
});
