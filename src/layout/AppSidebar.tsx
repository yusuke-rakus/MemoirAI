import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { DiaryItems } from "@/features/sidebar";
import { SidebarCreateDiaryButton } from "@/features/sidebar/components/SidebarCreateDiaryButton";
import { SidebarNavigation } from "@/features/sidebar/components/SidebarNavigation";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import { memo } from "react";

export const AppSidebar = memo(function AppSidebar() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  const setDiarySearchOpen = useDiarySearchStore((state) => state.setOpen);

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <div>
          <AppTooltip description={"サイドバーを閉じる"}>
            <SidebarToggleButton
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
            />
          </AppTooltip>
        </div>
        <div>
          <AppTooltip description={"日記を検索"}>
            <SidebarSearchButton onToggle={() => setDiarySearchOpen(true)} />
          </AppTooltip>
          <AppTooltip description={"新しい日記"}>
            <SidebarCreateDiaryButton />
          </AppTooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation />
        <DiaryItems />
      </SidebarContent>
    </Sidebar>
  );
});
