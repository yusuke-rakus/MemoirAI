import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";
import { SidebarDiaries } from "./components/SidebarDiaries";

export const DiaryItems = () => {
  return (
    <DiaryDetailProvider>
      <SidebarDiaries />
    </DiaryDetailProvider>
  );
};
