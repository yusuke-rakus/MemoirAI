import { memo } from "react";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";
import { SidebarDiaries } from "./components/SidebarDiaries";

export const DiaryItems = memo(function DiaryItems() {
  return (
    <DiaryDetailProvider>
      <SidebarDiaries />
    </DiaryDetailProvider>
  );
});
