import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import { useSidebar } from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const setDiarySearchOpen = useDiarySearchStore((state) => state.setOpen);

  const isSidebarOpen = isMobile ? openMobile : open;

  if (isMobile) {
    return (
      <header className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center border-b bg-background/95 px-2 shadow-xs backdrop-blur">
        <AppTooltip description={"サイドバーを開く"}>
          <SidebarToggleButton
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            className="rounded-lg"
          />
        </AppTooltip>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-medium">
          MemoirAI
        </span>
        <div className="ml-auto flex items-center gap-1">
          <AppTooltip description={"日記を検索"}>
            <SidebarSearchButton
              onToggle={() => setDiarySearchOpen(true)}
              className="rounded-lg"
            />
          </AppTooltip>
          <AppTooltip description={"新しい日記"}>
            <SidebarPenButton
              onToggle={() => navigate(PATHS.newDiary.path)}
              className="rounded-lg"
            />
          </AppTooltip>
        </div>
      </header>
    );
  }

  if (open) return null;

  return (
    <div
      role="toolbar"
      aria-label="ページ操作"
      className="fixed top-3 left-3 z-40 hidden flex-col gap-1 rounded-xl border bg-background/95 p-1 shadow-sm backdrop-blur md:flex"
    >
      <AppTooltip description={"サイドバーを開く"}>
        <SidebarToggleButton
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          className="size-9 rounded-lg"
        />
      </AppTooltip>
      <AppTooltip description={"日記を検索"}>
        <SidebarSearchButton
          onToggle={() => setDiarySearchOpen(true)}
          className="size-9 rounded-lg"
        />
      </AppTooltip>
      <AppTooltip description={"新しい日記"}>
        <SidebarPenButton
          onToggle={() => navigate(PATHS.newDiary.path)}
          className="size-9 rounded-lg"
        />
      </AppTooltip>
    </div>
  );
};
