import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { ChevronDown, Loader2, MessageSquareDashed } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetchFavoriteDiaries } from "../hooks/useFetchFavoriteDiaries";

export const SidebarFavorites = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile, setOpenMobile } = useSidebar();
  const { favoriteDiaries, isLoading, isLoadingMore, hasMore, loadMore } =
    useFetchFavoriteDiaries(isOpen);

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarGroup className="p-0">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="w-full cursor-pointer">
            お気に入り
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenuSub>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))
              ) : favoriteDiaries.length > 0 ? (
                <>
                  {favoriteDiaries.map((diary) => (
                    <SidebarMenuSubItem key={diary.sharedDiaryId}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={`${PATHS.sharedDiary.path}/${diary.sharedDiaryId}`}
                          onClick={handleNavigation}
                        >
                          <span className="truncate text-xs">
                            {diary.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  ))}
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
                  <p>お気に入りはありません</p>
                </div>
              )}
            </SidebarMenuSub>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
};
