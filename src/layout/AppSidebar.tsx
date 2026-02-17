import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { DiaryItems } from "@/features/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AppSidebar = () => {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  const menuItems = [PATHS.calendar, PATHS.diaries];

  const location = useLocation();
  const navigate = useNavigate();

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
            <SidebarSearchButton
              onToggle={() => {
                toast(":(機能が実装されていません");
              }}
            />
          </AppTooltip>
          <AppTooltip description={"新しい日記"}>
            <SidebarPenButton onToggle={() => navigate(PATHS.newDiary.path)} />
          </AppTooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>MemoriAI</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={item.path}>
                      <Icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>

        <DiaryItems />
      </SidebarContent>
    </Sidebar>
  );
};
