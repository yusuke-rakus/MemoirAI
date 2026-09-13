import { memo } from "react";

import { SidebarDiaries } from "./components/SidebarDiaries";

export const DiaryItems = memo(function DiaryItems() {
  return <SidebarDiaries />;
});
