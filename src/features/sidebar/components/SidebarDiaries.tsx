import {
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { format } from "date-fns";
import { ChevronDown, Loader2, MessageSquareDashed } from "lucide-react";
import { Link } from "react-router-dom";
import { useFetchDiary } from "../hooks/useFetchDiary";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";

export const SidebarDiaries = () => {
  const { loadMore, hasMore, isLoadingMore } = useFetchDiary();
  const { uploadedDiaries, isLoading } = useDiaryDetailStore();

  return (
    <>
      <SidebarGroupLabel>日記の一覧</SidebarGroupLabel>
      <SidebarMenuSub>
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))}
          </>
        ) : uploadedDiaries.length > 0 ? (
          <>
            {uploadedDiaries.map((diary) => {
              return (
                <SidebarMenuSubItem key={diary.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={`${PATHS.diaries.path}/${format(diary.date.toDate(), "yyyy-MM-dd")}`}
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
    </>
  );
};
