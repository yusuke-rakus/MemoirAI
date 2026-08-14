import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SidebarCreateDiaryButton } from "./SidebarCreateDiaryButton";

vi.mock("@/components/ui/sidebar", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/ui/sidebar")
  >("@/components/ui/sidebar");

  return {
    ...actual,
    useSidebar: () => ({
      isMobile: false,
      setOpenMobile: vi.fn(),
    }),
  };
});

describe("SidebarCreateDiaryButton", () => {
  it("ホバー時に親から渡されたツールチップを表示する", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AppTooltip description="新しい日記">
          <SidebarCreateDiaryButton />
        </AppTooltip>
      </MemoryRouter>,
    );

    await user.hover(screen.getByRole("button", { name: "新しい日記を書く" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("新しい日記");
  });
});
