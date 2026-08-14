import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LocalUser } from "@/contexts/LocalUserContext";
import { LogOut } from "lucide-react";
import { type ReactNode, useRef } from "react";

type AvatarMenuProps = {
  user: LocalUser | null;
  handleLogout?: () => void;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AvatarMenu = (props: AvatarMenuProps) => {
  const { user, handleLogout, children, open, onOpenChange } = props;
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const displayName = user?.displayName?.trim() || "ユーザー";
  const fallbackText =
    user?.displayName
      ?.split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  return (
    <div ref={contentContainerRef}>
      <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
        <DropdownMenuTrigger
          aria-label="アカウントメニューを開く"
          className="flex h-11 w-full items-start gap-2 rounded-md px-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:h-9"
        >
          <Avatar>
            <AvatarImage
              src={user?.photoURL ?? undefined}
              alt={user?.displayName ?? "ユーザー"}
            />
            <AvatarFallback>{fallbackText}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 truncate text-xs leading-4 font-medium">
            {displayName}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          container={contentContainerRef.current}
        >
          {children}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
