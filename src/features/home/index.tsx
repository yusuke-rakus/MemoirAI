import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { MainLayout } from "@/layout/MainLayout";
import { CalendarDays, Notebook } from "lucide-react";
import { CalendarView } from "./components/CalendarView";
import { MonthSelector } from "./components/MonthSelector";
import { DiaryVirew } from "./diaryList/DiaryVirew";

export const HomePage = () => {
  const { loading } = useAuthCheck();
  const tabs = [
    {
      value: "calendar",
      name: "カレンダー",
      icon: <CalendarDays />,
      component: <CalendarView />,
    },
    {
      value: "diaries",
      name: "日記一覧",
      icon: <Notebook />,
      component: <DiaryVirew />,
    },
  ];

  return loading ? (
    <h1>Loading...</h1>
  ) : (
    <MainLayout title="Home">
      <div className="flex justify-center w-full">
        <MonthSelector />
      </div>
      <Tabs defaultValue={tabs[0].value} className="w-full">
        <TabsList className="max-w-xs w-full p-0 bg-inherit justify-start border-b rounded-none">
          {tabs.map((tab) => {
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="
                  rounded-none
                  h-full
                  text-gray-400
                  border-t-0
                  border-r-0
                  border-b-2
                  border-l-0
                  transition-all
                  duration-250
                  data-[state=active]:shadow-none
                  data-[state=active]:border-primary
                  data-[state=active]:text-primary
                  data-[state=active]:bg-inherit
              "
              >
                <code className="flex items-center text-[16px] gap-1">
                  {tab.icon}
                  {tab.name}
                </code>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="w-full">
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </MainLayout>
  );
};
