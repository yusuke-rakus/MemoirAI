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
import { useLocation, useNavigate } from "react-router-dom";

export const AppSidebar = () => {
  const { open, setOpen } = useSidebar();

  const menuItems = [PATHS.calendar, PATHS.diaries, PATHS.newDiary];

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <div>
          <AppTooltip description={"サイドバーを閉じる"}>
            <SidebarToggleButton
              isOpen={open}
              onToggle={() => setOpen(!open)}
            />
          </AppTooltip>
        </div>
        <div>
          <AppTooltip description={"日記を検索"}>
            <SidebarSearchButton onToggle={() => {}} />
          </AppTooltip>
          <AppTooltip description={"新しい日記"}>
            <SidebarPenButton onToggle={() => navigate(PATHS.newDiary.path)} />
          </AppTooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <a href={item.path}>
                      <Icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
    </Sidebar>
  );
};
