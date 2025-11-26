import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { AvatarMenu } from "@/components/shared/header/AvatarMenu";
import { SettingsDropdownItem } from "@/components/shared/header/SettingsDropdownItem";
import { SettingsDropdownSubItem } from "@/components/shared/header/SettingsDropdownSubItem";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
import { getAuth, signOut } from "firebase/auth";
import { Moon, Settings, Sun, SunMoon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { open, setOpen } = useSidebar();
  const { localUser, setLocalUser } = useLocalUser();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    signOut(auth)
      .then(() => {
        setLocalUser(defaultLocalUser);
        navigate(PATHS.login.path);
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  const handleThemeLight = () => {
    console.log("ライト");
    document.documentElement.classList.remove("dark");
  };

  const handleThemeDark = () => {
    console.log("ダーク");
    document.documentElement.classList.add("dark");
  };

  const handleThemeSystem = () => {
    console.log("システム");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header
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
        <AppTooltip description={"サイドバーを開ける"}>
          <SidebarToggleButton isOpen={open} onToggle={() => setOpen(!open)} />
        </AppTooltip>
        <AppTooltip description={"日記を検索"}>
          <SidebarSearchButton onToggle={() => {}} />
        </AppTooltip>
        <AppTooltip description={"新しい日記"}>
          <SidebarPenButton onToggle={() => {}} />
        </AppTooltip>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <AvatarMenu user={localUser} handleLogout={handleLogout}>
          <SettingsDropdownSubItem icon={SunMoon} label={"テーマ"}>
            <SettingsDropdownItem
              onClick={handleThemeLight}
              icon={Sun}
              label="ライト"
            />
            <SettingsDropdownItem
              onClick={handleThemeDark}
              icon={Moon}
              label="ダーク"
            />
            <DropdownMenuSeparator />
            <SettingsDropdownItem
              onClick={handleThemeSystem}
              label="システム"
            />
          </SettingsDropdownSubItem>
          <SettingsDropdownItem icon={Settings} label="設定" />
        </AvatarMenu>
      </div>
    </header>
  );
};
