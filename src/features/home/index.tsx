import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Views } from "./constants/views";
import { useInitialDiaryDate } from "./hooks/useInitialDiaryDate";
import { MonthSelector } from "./monthSelector/MonthSelector";
import { CurrentDateProvider } from "./provider/CurrentDateProvider";

export const HomePage = () => {
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
      `${tab}/${initialDate.getFullYear()}/${initialDate.getMonth() + 1}`,
    );
  };

  return (
    <CurrentDateProvider initialDate={initialDate}>
      <div className="mx-auto flex w-full justify-center">
        <MonthSelector targetDate={initialDate} />
      </div>
      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="mx-auto w-full"
      >
        <TabsList className="mr-auto w-full max-w-xs justify-start rounded-none border-b bg-inherit p-0">
          {tabs.map((tab) => {
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => handleClickTab(tab.value)}
                className="h-full rounded-none border-t-0 border-r-0 border-b-2 border-l-0 text-muted-foreground transition-all duration-250 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <code className="flex items-center gap-1 text-[16px]">
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
    </CurrentDateProvider>
  );
};
