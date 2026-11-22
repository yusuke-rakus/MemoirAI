import { format } from "date-fns";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

import { NewDiaryView } from "./components/NewDiaryView";
import { useInitialDiaryDate } from "./hooks/useInitialDiaryDate";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";

export const NewDiaryPage = () => {
  const initialDate = useInitialDiaryDate();
  useDocumentTitle("日記を書く");

  return (
    <DiaryDetailProvider
      key={format(initialDate, "yyyy-MM-dd")}
      initialDate={initialDate}
    >
      <NewDiaryView />
    </DiaryDetailProvider>
  );
};
