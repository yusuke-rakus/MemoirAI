import { format } from "date-fns";
import { ChevronDown, Loader2, MessageSquareDashed } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";

import { useFetchDiary } from "../hooks/useFetchDiary";
import { SidebarFavorites } from "./SidebarFavorites";

export const SidebarDiaries = () => {
  const location = useLocation();
  const { diaries, isLoading, loadMore, hasMore, isLoadingMore } =
    useFetchDiary();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SidebarFavorites />
      <SidebarGroupLabel>最近の日記</SidebarGroupLabel>
      <SidebarMenuSub>
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))}
          </>
        ) : diaries.length > 0 ? (
          <>
            {diaries.map((diary) => {
              const href = `${PATHS.diaries.path}/${format(diary.date.toDate(), "yyyy-MM-dd")}#diary-${diary.id}`;
              const isActive = `${location.pathname}${location.hash}` === href;
              return (
                <SidebarMenuSubItem key={diary.id}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      to={href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={handleNavigation}
                    >
                      <span className="truncate text-xs">{diary.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              );
            })}
            {hasMore && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  disabled={isLoadingMore}
                  className="justify-center text-muted-foreground"
                  onClick={() => void loadMore()}
                >
                  {isLoadingMore ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ChevronDown />
                  )}
                  <span className="text-xs">
                    {isLoadingMore ? "読み込み中..." : "さらに10件表示"}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
            <MessageSquareDashed size={18} />
            <p>まだ日記がありません</p>
          </div>
        )}
      </SidebarMenuSub>
    </div>
  );
};
