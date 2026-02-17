import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { AvatarMenu } from "@/components/shared/header/AvatarMenu";
import { SettingsDropdownItem } from "@/components/shared/header/SettingsDropdownItem";
import { SettingsDropdownSubItem } from "@/components/shared/header/SettingsDropdownSubItem";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { type PrimaryColorKey } from "@/constants/primaryColors";
import type { THemeKey } from "@/constants/themes";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import {
  clearPrimaryColorOverrides,
  usePrimaryColor,
} from "@/hooks/usePrimaryColor";
import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { getAuth, signOut } from "firebase/auth";
import { Dot, Moon, Palette, Settings, Sun, SunMoon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Header = () => {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const { localUser, setLocalUser } = useLocalUser();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearPrimaryColorOverrides();
      setLocalUser(defaultLocalUser);
      navigate(PATHS.login.path);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("ログアウトに失敗しました");
    }
  };

  const { theme, setTheme } = useTheme();

  const handleThemeChange = (theme: THemeKey) => {
    switch (theme) {
      case "light":
        setTheme("light");
        toast("ライトテーマに設定しました", { icon: <Sun /> });
        break;
      case "dark":
        setTheme("dark");
        toast("ダークテーマに設定しました", { icon: <Moon /> });
        break;
      case "system":
        setTheme("system");
        toast("システム設定のテーマを使用します");
        break;
    }
  };

  const {
    primaryColor,
    primaryColorOptions,
    handlePrimaryColorChange,
    isSavingPrimaryColor,
  } = usePrimaryColor(localUser.uid);

  const onPrimaryColorClick = (colorKey: PrimaryColorKey) => {
    void handlePrimaryColorChange(colorKey);
  };

  const isSidebarOpen = isMobile ? openMobile : open;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-14 px-4 border-b bg-background shadow-sm z-40 items-center transition-all duration-250",
        open && !isMobile ? "left-64" : "left-0",
      )}
    >
      <div
        className={cn(
          "flex items-center h-full",
          open && !isMobile && "hidden",
        )}
      >
        <AppTooltip description={"サイドバーを開ける"}>
          <SidebarToggleButton
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
          />
        </AppTooltip>
        <AppTooltip description={"日記を検索"}>
          <SidebarSearchButton onToggle={() => {}} />
        </AppTooltip>
        <AppTooltip description={"新しい日記"}>
          <SidebarPenButton onToggle={() => navigate(PATHS.newDiary.path)} />
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
          <SettingsDropdownSubItem icon={Palette} label={"プライマリカラー"}>
            {primaryColorOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                disabled={isSavingPrimaryColor}
                onClick={() => onPrimaryColorClick(option.key)}
              >
                <span
                  className={cn(
                    "h-3 w-3 shrink-0 rounded-full border border-border",
                    option.previewClassName,
                  )}
                />
                {option.label}
                {primaryColor === option.key && (
                  <Dot className="text-primary ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </SettingsDropdownSubItem>
          <SettingsDropdownItem icon={Settings} label="設定" />
        </AvatarMenu>
      </div>
    </header>
  );
};
