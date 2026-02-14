import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Calendar } from "./calendar";

export const CalendarView = () => {
  useDocumentTitle("カレンダー");

  return (
    <>
      <div className="pb-10">
        <Calendar />
      </div>
      {/* <div className="w-full flex flex-col items-center">
        <Button onClick={handleGenerateText}>AI試験</Button>
        <Button onClick={handleCreate}>Create Diary</Button>
        <Button onClick={handleClickUpdate}>Update Diary</Button>
      </div> */}
    </>
  );
};
