import { getAuth, signOut } from "firebase/auth";
import { Settings } from "lucide-react";
import { memo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
import { useShortcut } from "@/hooks/useShortcut";
import { shortcutLabel } from "@/lib/shortcuts";
import { useDiarySearchStore } from "@/stores/diarySearchStore";

export const AppSidebar = memo(function AppSidebar() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const { localUser, setLocalUser } = useLocalUser();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    "profile" | "shortcuts"
  >("profile");
  const settingsReturnFocus = useRef<HTMLElement | null>(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const isSidebarOpen = isMobile ? openMobile : open;

  const setDiarySearchOpen = useDiarySearchStore((state) => state.setOpen);
  const enabled = Boolean(localUser.uid);
  useShortcut("newDiary", () => navigate(PATHS.newDiary.path), { enabled });
  useShortcut("search", () => setDiarySearchOpen(true), { enabled });
  useShortcut("sidebar", toggleSidebar, { enabled });
  useShortcut(
    "help",
    () => {
      settingsReturnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setSettingsSection("shortcuts");
      setIsSettingsDialogOpen(true);
    },
    { enabled: enabled && !isMobile },
  );

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
    settingsReturnFocus.current = null;
    setSettingsSection("profile");
    setIsAvatarMenuOpen(false);
    requestAnimationFrame(() => setIsSettingsDialogOpen(true));
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="flex flex-row items-center justify-between">
          <div>
            <AppTooltip
              description={`サイドバーを閉じる (${shortcutLabel("sidebar")})`}
              openOnFocus={false}
            >
              <SidebarToggleButton
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
              />
            </AppTooltip>
          </div>
          <div>
            <AppTooltip description={`日記を検索 (${shortcutLabel("search")})`}>
              <SidebarSearchButton onToggle={() => setDiarySearchOpen(true)} />
            </AppTooltip>
            <AppTooltip
              description={`新しい日記 (${shortcutLabel("newDiary")})`}
            >
              <SidebarCreateDiaryButton />
            </AppTooltip>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <SidebarNavigation />
          <DiaryItems />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
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
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SettingsDialog
        uid={localUser.uid}
        open={isSettingsDialogOpen}
        initialSection={settingsSection}
        returnFocusRef={settingsReturnFocus}
        onOpenChange={setIsSettingsDialogOpen}
      />
    </>
  );
});
