import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { MainLayout } from "@/layout/MainLayout";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MonthSelector } from "./monthSelector/MonthSelector";
import { Views } from "./constants/views";
import { useUrlDate } from "./hooks/useUrlDate";

export const HomePage = () => {
  const { loading } = useAuthCheck();
  const tabs = Views;
  const location = useLocation();

  const targetDate: Date = useUrlDate();

  const [tabValue, setTabValue] = useState<string>();
  useEffect(() => {
    for (const tab of tabs) {
      if (tab.value === location.pathname) {
        setTabValue(tab.value);
      }
    }
  }, [location.pathname, tabs]);

  const navigate = useNavigate();
  const handleClickTab = (tab: string) => {
    navigate(`${tab}${location.search}`);
  };

  return loading ? (
    <h1>Loading...</h1>
  ) : (
    <MainLayout>
      <div className="flex justify-center w-full">
        <MonthSelector targetDate={targetDate} />
      </div>
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="max-w-xs w-full p-0 bg-inherit justify-start border-b rounded-none">
          {tabs.map((tab) => {
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => handleClickTab(tab.value)}
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
