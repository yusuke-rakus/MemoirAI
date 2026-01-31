import {
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useFetchDiary } from "../hooks/useFetchDiary";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import { Link } from "react-router-dom";

export const SidebarDiaries = () => {
  useFetchDiary();
  const { uploadedDiaries } = useDiaryDetailStore();

  return (
    <>
      <SidebarGroupLabel>日記の一覧</SidebarGroupLabel>
      <SidebarMenuSub>
        {uploadedDiaries.length > 0 ? (
          <>
            {uploadedDiaries.map((diary, i) => {
              return (
                <SidebarMenuSubItem key={i}>
                  <SidebarMenuButton asChild>
                    <Link to={"/"}>
                      <span className="truncate text-xs">{diary.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              );
            })}
          </>
        ) : (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))}
          </>
        )}
      </SidebarMenuSub>
    </>
  );
};
