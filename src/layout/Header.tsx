import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { AvatarMenu } from "@/components/shared/header/AvatarMenu";
import { SettingsDialog } from "@/components/shared/header/SettingsDialog";
import { SettingsDropdownItem } from "@/components/shared/header/SettingsDropdownItem";
import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import { useSidebar } from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { clearPrimaryColorOverrides } from "@/hooks/usePrimaryColor";
import { cn } from "@/lib/utils";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import { getAuth, signOut } from "firebase/auth";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Header = () => {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const { localUser, setLocalUser } = useLocalUser();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const setDiarySearchOpen = useDiarySearchStore((state) => state.setOpen);

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

  const handleSettingsSelect = () => {
    setIsAvatarMenuOpen(false);
    requestAnimationFrame(() => setIsSettingsDialogOpen(true));
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
      <div className="ml-auto flex items-center gap-4">
        <AvatarMenu
          user={localUser}
          handleLogout={handleLogout}
          open={isAvatarMenuOpen}
          onOpenChange={setIsAvatarMenuOpen}
        >
          <SettingsDropdownItem
            icon={Settings}
            label="設定"
            onSelect={handleSettingsSelect}
          />
        </AvatarMenu>
        <SettingsDialog
          uid={localUser.uid}
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
        />
      </div>
    </header>
  );
};
