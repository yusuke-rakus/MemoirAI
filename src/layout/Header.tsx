import { AvatarMenu } from "@/components/shared/header/AvatarMenu";
import { SettingsDropdownItem } from "@/components/shared/header/SettingsDropdownItem";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { getAuth, signOut } from "firebase/auth";
import { Settings, SunMoon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import { useSidebar } from "@/components/ui/sidebar";
import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { cn } from "@/lib/utils";

export const Header = () => {
  // const { layout, setLayout } = useLayout();
  const { open, setOpen } = useSidebar();
  const { localUser, setLocalUser } = useLocalUser();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    signOut(auth)
      .then(() => {
        setLocalUser(defaultLocalUser);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <header
      // className={`fixed
      // top-0
      // right-0
      // h-14
      // px-4
      // border-b
      // bg-white
      // shadow-sm
      // z-40
      // items-center
      // transition-all
      // duration-250
      // ${open ? "left-64" : "left-0"}
      // `}
      className={cn(
        "fixed top-0 right-0 h-14 px-4 border-b bg-white shadow-sm z-40 items-center transition-all duration-250",
        open ? "left-64" : "left-0"
      )}
    >
      <div
        className={`flex
        items-center
        h-full
        ${open ? "hidden" : ""}
      `}
      >
        <AppTooltip discription={"サイドバーを開ける"}>
          <SidebarToggleButton isOpen={open} onToggle={() => setOpen(!open)} />
        </AppTooltip>
        <AppTooltip discription={"日記を検索"}>
          <SidebarSearchButton onToggle={() => {}} />
        </AppTooltip>
        <AppTooltip discription={"新しい日記"}>
          <SidebarPenButton onToggle={() => {}} />
        </AppTooltip>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <AvatarMenu user={localUser} handleLogout={handleLogout}>
          <SettingsDropdownItem icon={SunMoon} label="テーマ" />
          <SettingsDropdownItem icon={Settings} label="設定" />
        </AvatarMenu>
      </div>
    </header>
  );
};
