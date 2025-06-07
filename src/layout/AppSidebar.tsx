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
import { EqualApproximately, Home } from "lucide-react";
import { useLocation } from "react-router-dom";

export const AppSidebar = () => {
  const { open, setOpen } = useSidebar();

  const menuItems = [
    { name: "Home", icon: Home, link: "/" },
    { name: "About", icon: EqualApproximately, link: "/about" },
  ];

  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <div>
          <AppTooltip discription={"サイドバーを閉じる"}>
            <SidebarToggleButton
              isOpen={open}
              onToggle={() => setOpen(!open)}
            />
          </AppTooltip>
        </div>
        <div>
          <AppTooltip discription={"日記を検索"}>
            <SidebarSearchButton onToggle={() => {}} />
          </AppTooltip>
          <AppTooltip discription={"新しい日記"}>
            <SidebarPenButton onToggle={() => {}} />
          </AppTooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.link}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.link}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
    </Sidebar>
  );
};
