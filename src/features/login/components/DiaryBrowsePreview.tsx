import { CalendarDays, Notebook } from "lucide-react";

import { FadeContent } from "@/components/ui/fade-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import walterCalendar from "../assets/walter-calendar.webp";
import walterCalendarMobile from "../assets/walter-calendar-mobile.webp";
import walterDiaryList from "../assets/walter-diary-list.webp";
import walterDiaryListMobile from "../assets/walter-diary-list-mobile.webp";

const views = [
  {
    value: "calendar",
    label: "カレンダー",
    icon: CalendarDays,
    image: walterCalendar,
    mobileImage: walterCalendarMobile,
    alt: "2026年11月の月間カレンダー。日記を書いた8日、11日、16日、20日のマスにタイトルが表示されている。",
    description: "日付から、読み返したい日記を見つける。",
  },
  {
    value: "diary-list",
    label: "日記一覧",
    icon: Notebook,
    image: walterDiaryList,
    mobileImage: walterDiaryListMobile,
    alt: "11月の日記が新しい順に並ぶ一覧。各日記の日付、タイトル、本文の抜粋、タグが表示されている。",
    description: "タイトルと本文の抜粋で、ひと月の記録を振り返る。",
  },
] as const;

export const DiaryBrowsePreview = () => (
  <section
    aria-labelledby="diary-browse-heading"
    className="mx-auto mt-12 w-full max-w-3xl px-3 sm:mt-16"
  >
    <h2
      id="diary-browse-heading"
      className="mb-4 text-center text-xl font-semibold tracking-tight sm:mb-6 sm:text-2xl"
    >
      書いた日記を見返す
    </h2>

    <Tabs
      defaultValue="calendar"
      className="gap-3 rounded-2xl border border-border/80 bg-background/80 p-3 shadow-sm backdrop-blur-md sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList aria-label="作例の表示方法" className="h-10">
          {views.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="px-2 sm:px-3">
              <Icon aria-hidden="true" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {views.map(({ value, image, mobileImage, alt, description }) => (
        <TabsContent
          key={value}
          value={value}
          className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <FadeContent>
            <figure>
              <picture>
                <source
                  media="(width < 40rem)"
                  srcSet={mobileImage}
                  width={390}
                  height={844}
                />
                <img
                  className="block h-auto w-full rounded-lg border border-border"
                  src={image}
                  width={1280}
                  height={720}
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption className="px-1 pt-3 text-sm text-muted-foreground">
                {description}
              </figcaption>
            </figure>
          </FadeContent>
        </TabsContent>
      ))}
    </Tabs>
  </section>
);
