import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { AvatarMenu } from "@/components/shared/header/AvatarMenu";
import { SettingsDropdownItem } from "@/components/shared/header/SettingsDropdownItem";
import { SettingsDropdownSubItem } from "@/components/shared/header/SettingsDropdownSubItem";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import useTheme, { type Theme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { getAuth, signOut } from "firebase/auth";
import { Moon, Settings, Sun, SunMoon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const { theme, setTheme } = useTheme();

  const handleThemeChange = (theme: Theme) => {
    switch (theme) {
      case "light":
        setTheme("light");
        toast("ライトテーマにしました", { icon: <Sun /> });
        break;
      case "dark":
        setTheme("dark");
        toast("ダークテーマにしました", { icon: <Moon /> });
        break;
      case "system":
        setTheme("system");
        toast("システム設定のテーマを使用します");
        break;
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-14 px-4 border-b bg-background shadow-sm z-40 items-center transition-all duration-250",
        open ? "left-64" : "left-0"
      )}
    >
      <div className={cn("flex items-center h-full", open && "hidden")}>
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
              onClick={() => handleThemeChange("light")}
              icon={Sun}
              label="ライト"
              active={theme === "light"}
            />
            <SettingsDropdownItem
              onClick={() => handleThemeChange("dark")}
              icon={Moon}
              label="ダーク"
              active={theme === "dark"}
            />
            <DropdownMenuSeparator />
            <SettingsDropdownItem
              onClick={() => handleThemeChange("system")}
              label="システム"
              active={theme === "system"}
            />
          </SettingsDropdownSubItem>
          <SettingsDropdownItem icon={Settings} label="設定" />
        </AvatarMenu>
      </div>
    </header>
  );
};
