import {
  Brain,
  Keyboard,
  Settings,
  Share2,
  UserRound,
  UserRoundX,
} from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

import { AccountSettingsTab } from "./AccountSettingsTab";
import { GeneralSettingsSection } from "./GeneralSettingsSection";
import { MemorySettingsSection } from "./MemorySettingsSection";
import { ProfileSettingsForm } from "./ProfileSettingsForm";
import { SharedDiariesSettingsSection } from "./SharedDiariesSettingsSection";
import { ShortcutSettingsSection } from "./ShortcutSettingsSection";

type Props = {
  uid?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: "profile" | "shortcuts";
  returnFocusRef?: RefObject<HTMLElement | null>;
};

type SettingsSection =
  "profile" | "general" | "shortcuts" | "memory" | "shared-diaries" | "account";

export const SettingsDialog = ({
  uid,
  open,
  onOpenChange,
  initialSection = "profile",
  returnFocusRef,
}: Props) => {
  const isMobile = useIsMobile();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [isAccountDeleting, setIsAccountDeleting] = useState(false);

  useEffect(() => {
    if (open) setActiveSection(initialSection);
    if (!open) {
      setActiveSection("profile");
      setIsAccountDeleting(false);
    }
  }, [open, initialSection]);

  useEffect(() => {
    if (isMobile && activeSection === "shortcuts") {
      setActiveSection("profile");
    }
  }, [activeSection, isMobile]);

  const handleSectionChange = (section: string) => {
    if (
      section === "profile" ||
      section === "general" ||
      section === "shortcuts" ||
      section === "memory" ||
      section === "shared-diaries" ||
      section === "account"
    ) {
      setActiveSection(section);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isAccountDeleting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        onCloseAutoFocus={(event) => {
          if (returnFocusRef?.current?.isConnected) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
        className="flex h-[min(720px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-5 text-left sm:px-6">
          <DialogTitle ref={titleRef} tabIndex={-1}>
            設定
          </DialogTitle>
          <DialogDescription className="sr-only">
            プロフィール、表示、メモリ、共有した日記、アカウントを確認できます。
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeSection}
          onValueChange={handleSectionChange}
          className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:grid-rows-1"
        >
          <nav
            aria-label="設定カテゴリー"
            className="shrink-0 overflow-x-auto overscroll-x-contain border-b [scrollbar-width:none] sm:min-h-0 sm:overflow-x-hidden sm:overflow-y-auto sm:border-r sm:border-b-0 sm:bg-muted/30 sm:p-4 [&::-webkit-scrollbar]:hidden"
          >
            <TabsList
              className="h-auto min-w-max justify-start rounded-none bg-transparent px-3 py-0 sm:w-full sm:min-w-0 sm:flex-col sm:gap-1 sm:p-0"
              aria-label="設定カテゴリー"
            >
              <TabsTrigger
                value="profile"
                className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
              >
                <UserRound className="size-4" />
                プロフィール
              </TabsTrigger>
              <TabsTrigger
                value="general"
                className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
              >
                <Settings className="size-4" />
                一般
              </TabsTrigger>
              {!isMobile && (
                <TabsTrigger
                  value="shortcuts"
                  className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
                >
                  <Keyboard className="size-4" />
                  ショートカット
                </TabsTrigger>
              )}
              <TabsTrigger
                value="memory"
                className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
              >
                <Brain className="size-4" />
                メモリ
              </TabsTrigger>
              <TabsTrigger
                value="shared-diaries"
                className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
              >
                <Share2 className="size-4" />
                共有した日記
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
              >
                <UserRoundX className="size-4" />
                アカウント
              </TabsTrigger>
            </TabsList>
          </nav>
          <section className="flex min-h-0 min-w-0 flex-col">
            <TabsContent
              value="profile"
              className="m-0 flex min-h-0 flex-1 flex-col"
            >
              <div className="shrink-0 border-b px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold">プロフィール</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  公開されるプロフィール情報を変更できます。
                </p>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="px-5 py-5 sm:px-6">
                  <ProfileSettingsForm uid={uid} />
                </div>
              </ScrollArea>
            </TabsContent>
            <GeneralSettingsSection uid={uid} />
            {!isMobile && <ShortcutSettingsSection />}
            <MemorySettingsSection
              uid={uid}
              isActive={open && activeSection === "memory"}
            />
            <TabsContent
              value="shared-diaries"
              className="m-0 flex min-h-0 flex-1 flex-col"
            >
              <div className="shrink-0 border-b px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold">共有した日記</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  共有中の日記を確認し、共有を解除できます。
                </p>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="px-5 py-5 sm:px-6">
                  <SharedDiariesSettingsSection uid={uid} />
                </div>
              </ScrollArea>
            </TabsContent>
            <AccountSettingsTab
              uid={uid}
              onDeleted={() => onOpenChange(false)}
              onDeletingChange={setIsAccountDeleting}
            />
          </section>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
