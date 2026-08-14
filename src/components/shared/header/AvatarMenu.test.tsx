import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { AvatarMenu } from "./AvatarMenu";

const MobileSidebarAvatarMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open>
      <SheetContent data-testid="mobile-sidebar">
        <SheetHeader className="sr-only">
          <SheetTitle>サイドバー</SheetTitle>
          <SheetDescription>
            モバイル用のナビゲーションメニューです。
          </SheetDescription>
        </SheetHeader>
        <AvatarMenu
          user={{
            uid: "user-1",
            displayName: "テスト ユーザー",
            photoURL: null,
          }}
          open={open}
          onOpenChange={setOpen}
        >
          <span>設定</span>
        </AvatarMenu>
      </SheetContent>
    </Sheet>
  );
};

describe("AvatarMenu", () => {
  it("モバイル用サイドバー内ではメニュー内容もSheet内に表示する", async () => {
    const user = userEvent.setup();

    render(<MobileSidebarAvatarMenu />);

    expect(screen.getByText("テスト ユーザー")).toHaveClass(
      "text-xs",
      "leading-4",
    );
    expect(
      screen.getByRole("button", { name: "アカウントメニューを開く" }),
    ).toHaveClass("items-start");

    await user.click(
      screen.getByRole("button", { name: "アカウントメニューを開く" }),
    );

    expect(
      within(screen.getByTestId("mobile-sidebar")).getByText("設定"),
    ).toBeVisible();
  });
});
