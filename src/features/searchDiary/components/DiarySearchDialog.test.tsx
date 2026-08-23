import type { Diary } from "@/types/diary/diary";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timestamp } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import { DiarySearchDialog } from "./DiarySearchDialog";

const mocks = vi.hoisted(() => ({
  getByUid: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/contexts/LocalUserContext", () => ({
  useLocalUser: () => ({ localUser: { uid: "user-1" } }),
}));

vi.mock("@/lib/service/diaryClient", () => ({
  DiaryClient: { getByUid: mocks.getByUid },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

const createDiary = (
  id: string,
  date: Date,
  title: string,
  tags: Diary["tags"],
): Diary => ({
  id,
  uid: "user-1",
  date: Timestamp.fromDate(date),
  title,
  content: `${title}の本文`,
  tags,
  createdAt: Timestamp.fromDate(date),
});

const setCachedDiaries = (diaries: Diary[]) => {
  act(() => {
    useDiarySearchStore.setState({
      open: true,
      cachedUid: "user-1",
      diaries,
    });
  });
};

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  useDiarySearchStore.setState({
    open: false,
    cachedUid: null,
    diaries: [],
  });
});

describe("DiarySearchDialog", () => {
  it("頻出タグを表示し、クリックしたタグを既存の検索語へ追加する", async () => {
    const today = new Date();
    setCachedDiaries([
      createDiary("diary-1", today, "旅行と散歩", [
        { name: "散歩", color: "lime" },
      ]),
      createDiary("diary-2", today, "家族旅行で散歩", [
        { name: "散歩", color: "sky" },
        { name: "家族", color: "pink" },
      ]),
    ]);
    const user = userEvent.setup();

    render(<DiarySearchDialog />);

    const frequentTags = screen.getByRole("region", {
      name: "よく使うタグ",
    });
    expect(frequentTags).toHaveClass("min-w-0");
    const tagRow = frequentTags.querySelector(".w-max");
    expect(tagRow).toHaveClass("flex", "w-max");
    expect(tagRow).not.toHaveClass("flex-wrap");

    const input = screen.getByRole("textbox", {
      name: "日記の検索キーワード",
    });
    await user.type(input, "旅行");
    await user.click(
      screen.getByRole("button", { name: "「散歩」を検索語に追加" }),
    );

    expect(input).toHaveValue("旅行 散歩");
    await waitFor(() => {
      expect(screen.getByText("旅行と散歩")).toBeInTheDocument();
      expect(screen.getByText("家族旅行で散歩")).toBeInTheDocument();
    });
    expect(
      document.querySelectorAll('[data-slot="separator-root"]'),
    ).toHaveLength(1);
  });

  it("直近1年にタグがなければ頻出タグ欄を表示しない", () => {
    const olderThanOneYear = new Date();
    olderThanOneYear.setFullYear(olderThanOneYear.getFullYear() - 2);
    setCachedDiaries([
      createDiary("old-diary", olderThanOneYear, "昔の日記", [
        { name: "過去", color: "default" },
      ]),
    ]);

    render(<DiarySearchDialog />);

    expect(
      screen.queryByRole("region", { name: "よく使うタグ" }),
    ).not.toBeInTheDocument();
  });

  it("日記の取得中はloadingを表示する", async () => {
    mocks.getByUid.mockReturnValue(new Promise(() => undefined));
    act(() => useDiarySearchStore.getState().setOpen(true));

    render(<DiarySearchDialog />);

    expect(
      await screen.findByText("日記を読み込んでいます…"),
    ).toBeInTheDocument();
  });

  it("日記の取得成功後にloadingを解除して頻出タグを表示する", async () => {
    const today = new Date();
    mocks.getByUid.mockResolvedValue([
      createDiary("loaded-diary", today, "読み込んだ日記", [
        { name: "仕事", color: "indigo" },
      ]),
    ]);
    act(() => useDiarySearchStore.getState().setOpen(true));

    render(<DiarySearchDialog />);

    expect(
      await screen.findByRole("button", {
        name: "「仕事」を検索語に追加",
      }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByText("日記を読み込んでいます…"),
      ).not.toBeInTheDocument();
    });
  });

  it("日記の取得に失敗した場合はerrorを表示する", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getByUid.mockRejectedValue(new Error("failed"));
    act(() => useDiarySearchStore.getState().setOpen(true));

    render(<DiarySearchDialog />);

    expect(
      await screen.findByText(
        "日記を読み込めませんでした。ダイアログを開き直してください。",
      ),
    ).toBeInTheDocument();
  });
});
