import {
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { MessageSquareDashed } from "lucide-react";
import { Link } from "react-router-dom";
import { useFetchDiary } from "../hooks/useFetchDiary";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import { PATHS } from "@/constants/path";
import { format } from "date-fns";

export const SidebarDiaries = () => {
  useFetchDiary();
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
            {uploadedDiaries.map((diary, i) => {
              return (
                <SidebarMenuSubItem key={i}>
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
