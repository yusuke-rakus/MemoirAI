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
import type { ReactNode } from "react";

type AvatarMenuProps = {
  user: LocalUser | null;
  handleLogout?: () => void;
  children: ReactNode;
};

export const AvatarMenu = (props: AvatarMenuProps) => {
  const { user, handleLogout, children } = props;
  const fallbackText =
    user?.displayName
      ?.split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  return (
    <div className="absolute top-2 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage
              src={user?.photoURL ?? undefined}
              alt={user?.displayName ?? "ユーザー"}
            />
            <AvatarFallback>{fallbackText}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
