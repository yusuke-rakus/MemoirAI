import { memo } from "react";

import { SidebarDiaries } from "./components/SidebarDiaries";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";

export const DiaryItems = memo(function DiaryItems() {
  return (
    <DiaryDetailProvider>
      <SidebarDiaries />
    </DiaryDetailProvider>
  );
});
