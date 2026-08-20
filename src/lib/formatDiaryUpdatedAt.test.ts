import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";
import {
  formatDiaryUpdatedAt,
  getDiaryUpdatedAt,
} from "./formatDiaryUpdatedAt";

const now = new Date("2026-08-20T12:00:00");
const timestamp = (value: string) => Timestamp.fromDate(new Date(value));
const diaryAt = (value: string) => ({ createdAt: timestamp(value) });

describe("formatDiaryUpdatedAt", () => {
  it.each([
    ["2026-08-20T11:59:01", "たった今"],
    ["2026-08-20T11:59:00", "1分前"],
    ["2026-08-20T11:01:00", "59分前"],
    ["2026-08-20T11:00:00", "1時間前"],
    ["2026-08-19T13:00:00", "23時間前"],
    ["2026-08-19T12:00:00", "1日前"],
    ["2026-08-14T12:00:00", "6日前"],
    ["2026-08-13T12:00:00", "1週間前"],
    ["2026-07-24T12:00:00", "3週間前"],
    ["2026-07-23T12:00:00", "1か月前"],
    ["2026-06-20T12:00:00", "2か月前"],
    ["2026-05-21T12:00:00", "2か月前"],
  ])("%sを%sと表示する", (value, expected) => {
    expect(formatDiaryUpdatedAt(diaryAt(value), now)).toBe(expected);
  });

  it("3か月以上前は日付を表示する", () => {
    expect(formatDiaryUpdatedAt(diaryAt("2026-05-20T12:00:00"), now)).toBe(
      "2026年5月20日",
    );
  });

  it("未来の日時はたった今と表示する", () => {
    expect(formatDiaryUpdatedAt(diaryAt("2026-08-20T12:01:00"), now)).toBe(
      "たった今",
    );
  });

  it("updatedAtを優先し、ない場合はcreatedAtへフォールバックする", () => {
    const createdAt = timestamp("2026-08-20T10:00:00");
    const updatedAt = timestamp("2026-08-20T11:00:00");

    expect(getDiaryUpdatedAt({ createdAt, updatedAt })).toEqual(
      updatedAt.toDate(),
    );
    expect(getDiaryUpdatedAt({ createdAt })).toEqual(createdAt.toDate());
  });
});
