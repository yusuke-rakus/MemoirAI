import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import { useSidebar } from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const setDiarySearchOpen = useDiarySearchStore((state) => state.setOpen);

  const isSidebarOpen = isMobile ? openMobile : open;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-14 items-center border-b bg-background px-4 shadow-sm transition-all duration-250",
        open && !isMobile ? "left-64" : "left-0",
      )}
    >
      <div
        className={cn(
          "flex h-full items-center",
          open && !isMobile && "hidden",
        )}
      >
        <AppTooltip description={"サイドバーを開く"}>
          <SidebarToggleButton
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
          />
        </AppTooltip>
        <AppTooltip description={"日記を検索"}>
          <SidebarSearchButton onToggle={() => setDiarySearchOpen(true)} />
        </AppTooltip>
        <AppTooltip description={"新しい日記"}>
          <SidebarPenButton onToggle={() => navigate(PATHS.newDiary.path)} />
        </AppTooltip>
      </div>
    </header>
  );
};
