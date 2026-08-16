import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { AvatarMenu } from "@/components/shared/header/AvatarMenu";
import { SettingsDialog } from "@/components/shared/header/SettingsDialog";
import { SettingsDropdownItem } from "@/components/shared/header/SettingsDropdownItem";
import { SidebarSearchButton } from "@/components/shared/sidebar/SidebarSearchButton";
import { SidebarToggleButton } from "@/components/shared/sidebar/SidebarToggleButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { DiaryItems } from "@/features/sidebar";
import { SidebarCreateDiaryButton } from "@/features/sidebar/components/SidebarCreateDiaryButton";
import { SidebarNavigation } from "@/features/sidebar/components/SidebarNavigation";
import { clearPrimaryColorOverrides } from "@/hooks/usePrimaryColor";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import { getAuth, signOut } from "firebase/auth";
import { Settings } from "lucide-react";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AppSidebar = memo(function AppSidebar() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const { localUser, setLocalUser } = useLocalUser();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const isSidebarOpen = isMobile ? openMobile : open;

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

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <div>
          <AppTooltip description={"サイドバーを閉じる"} openOnFocus={false}>
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
      <SidebarContent className="overflow-hidden">
        <SidebarNavigation />
        <DiaryItems />
      </SidebarContent>
      <SidebarFooter>
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
      </SidebarFooter>
    </Sidebar>
  );
});
