import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { MainLayout } from "@/layout/MainLayout";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Views } from "./constants/views";
import { useInitialDiaryDate } from "./hooks/useInitialDate";
import { MonthSelector } from "./monthSelector/MonthSelector";
import { CurrentDateProvider } from "./provider/CurrentDateProvider";

export const HomePage = () => {
  const { loading } = useAuthCheck();
  const tabs = Views;
  const location = useLocation();
  const initialDate = useInitialDiaryDate();

  const [tabValue, setTabValue] = useState<string>();
  useEffect(() => {
    for (const tab of tabs) {
      const basePath = tab.value.endsWith("/")
        ? tab.value.slice(0, -1)
        : tab.value;
      if (
        location.pathname === basePath ||
        location.pathname.startsWith(`${basePath}/`)
      ) {
        setTabValue(tab.value);
        return;
      }
    }
  }, [location.pathname, tabs]);

  const navigate = useNavigate();
  const handleClickTab = (tab: string) => {
    navigate(
      `${tab}/${initialDate.getFullYear()}/${initialDate.getMonth() + 1}`
    );
  };

  return loading ? (
    <h1>Loading...</h1>
  ) : (
    <CurrentDateProvider initialDate={initialDate}>
      <MainLayout>
        <div className="flex justify-center w-full max-w-3xl mx-auto">
          <MonthSelector targetDate={initialDate} />
        </div>
        <Tabs
          value={tabValue}
          onValueChange={setTabValue}
          className="w-full max-w-3xl mx-auto"
        >
          <TabsList className="mr-auto max-w-xs w-full p-0 bg-inherit justify-start border-b rounded-none">
            {tabs.map((tab) => {
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  onClick={() => handleClickTab(tab.value)}
                  className="
                  rounded-none
                  h-full
                  text-muted-foreground
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
    </CurrentDateProvider>
  );
};
