import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CircleX, Search } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DiaryMarkdown } from "@/components/shared/diary/DiaryMarkdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { tagBgMap } from "@/constants/tagColors";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryQueryKeys } from "@/lib/query/queryKeys";
import { DiaryClient } from "@/lib/service/diaryClient";
import { matchesShortcut } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import type { Diary } from "@/types/diary/diary";

import {
  appendSearchTerm,
  createDiarySearchIndex,
  getFrequentTags,
  searchDiaryIndex,
} from "../lib/diarySearch";
import { parseSharedDiaryUrl } from "../lib/sharedDiaryUrl";

export const DiarySearchDialog = () => {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { localUser } = useLocalUser();
  const { open, setOpen } = useDiarySearchStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsId = useId();
  const urlErrorId = useId();
  const sharedUrl = parseSharedDiaryUrl(query, window.location.origin);
  const isUrlInput = sharedUrl.kind !== "keyword";
  const diariesQuery = useQuery({
    queryKey: diaryQueryKeys.search(localUser.uid),
    enabled: open && Boolean(localUser.uid),
    queryFn: async () =>
      (await DiaryClient.getByUid<Diary>(localUser.uid)) ?? [],
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const cachedDiaries = useMemo(
    () => diariesQuery.data ?? [],
    [diariesQuery.data],
  );
  const frequentTags = useMemo(
    () => (open ? getFrequentTags(cachedDiaries) : []),
    [cachedDiaries, open],
  );
  const searchIndex = useMemo(
    () => createDiarySearchIndex(cachedDiaries),
    [cachedDiaries],
  );
  const results = useMemo(
    () =>
      open && !isUrlInput ? searchDiaryIndex(searchIndex, debouncedQuery) : [],
    [searchIndex, debouncedQuery, open, isUrlInput],
  );
  const visibleResults = results.slice(0, 50);
  const canOpenResult =
    !isUrlInput &&
    open &&
    query === debouncedQuery &&
    Boolean(query.trim()) &&
    !diariesQuery.isFetching &&
    !diariesQuery.isError &&
    visibleResults.length > 0;
  useEffect(() => setSelectedIndex(0), [results, open]);
  useEffect(() => {
    if (canOpenResult)
      document
        .getElementById(`${resultsId}-${selectedIndex}`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [canOpenResult, resultsId, selectedIndex]);

  const openDiary = (diary: Diary) => {
    setOpen(false);
    setQuery("");
    navigate(
      `/diaries/${format(diary.date.toDate(), "yyyy-MM-dd")}#diary-${diary.id}`,
    );
  };

  const openSharedDiary = () => {
    if (sharedUrl.kind !== "shared") return;
    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
    if (isMobile) setOpenMobile(false);
    navigate(sharedUrl.path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-2xl"
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle>日記を検索</DialogTitle>
          <DialogDescription>
            日記を検索、または共有URLから開く
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
          <Input
            role={isUrlInput ? undefined : "combobox"}
            aria-autocomplete={isUrlInput ? undefined : "list"}
            aria-expanded={isUrlInput ? undefined : canOpenResult}
            aria-controls={isUrlInput ? undefined : resultsId}
            aria-invalid={sharedUrl.kind === "invalid"}
            aria-describedby={
              sharedUrl.kind === "invalid" ? urlErrorId : undefined
            }
            aria-activedescendant={
              canOpenResult ? `${resultsId}-${selectedIndex}` : undefined
            }
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (isUrlInput && event.key === "Enter") {
                event.preventDefault();
                openSharedDiary();
                return;
              }
              if (!canOpenResult) return;
              if (matchesShortcut(event.nativeEvent, "resultNext")) {
                event.preventDefault();
                setSelectedIndex((index) =>
                  Math.min(index + 1, visibleResults.length - 1),
                );
              } else if (matchesShortcut(event.nativeEvent, "resultPrevious")) {
                event.preventDefault();
                setSelectedIndex((index) => Math.max(index - 1, 0));
              } else if (matchesShortcut(event.nativeEvent, "resultOpen")) {
                const result = visibleResults[selectedIndex];
                if (result) {
                  event.preventDefault();
                  openDiary(result.diary);
                }
              }
            }}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="キーワードまたは共有URLを入力"
            aria-label="日記の検索キーワードまたは共有URL"
            className="border-0 px-0 shadow-none focus-visible:ring-0"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 p-0 text-muted-foreground [&_svg]:size-5"
              onClick={() => setQuery("")}
              disabled={!query}
              aria-label="検索語を削除"
            >
              <CircleX aria-hidden="true" />
            </Button>
          )}
        </div>
        {sharedUrl.kind === "invalid" && (
          <p
            id={urlErrorId}
            role="alert"
            className="px-5 py-3 text-sm text-destructive"
          >
            このアプリの共有URLを入力してください。
          </p>
        )}
        {sharedUrl.kind === "shared" && (
          <div className="px-5 py-4">
            <Button type="button" onClick={openSharedDiary} className="w-full">
              共有日記を開く
            </Button>
          </div>
        )}
        {!isUrlInput && frequentTags.length > 0 && (
          <section
            className="min-w-0 border-b border-border/60 px-5 py-3"
            aria-label="よく使うタグ"
          >
            <ScrollArea className="w-full min-w-0 pb-2">
              <div className="flex w-max gap-2">
                {frequentTags.map((tag) => (
                  <Badge
                    key={tag.name}
                    asChild
                    className={cn(
                      tagBgMap[tag.color] ?? "bg-muted-foreground",
                      "cursor-pointer transition-opacity hover:opacity-80",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setQuery((currentQuery) =>
                          appendSearchTerm(currentQuery, tag.name),
                        )
                      }
                      aria-label={`「${tag.name}」を検索語に追加`}
                    >
                      {tag.name}
                    </button>
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}
        {!isUrlInput && (
          <ScrollArea className="h-[min(60vh,480px)]">
            <div
              id={resultsId}
              className="p-3"
              role="listbox"
              aria-label="検索結果"
            >
              {diariesQuery.isLoading && !query && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  日記を読み込んでいます…
                </p>
              )}
              {!diariesQuery.isLoading && diariesQuery.isError && (
                <p className="p-6 text-center text-sm text-destructive">
                  日記を読み込めませんでした。ダイアログを開き直してください。
                </p>
              )}
              {!diariesQuery.isLoading &&
                !diariesQuery.isError &&
                !debouncedQuery && (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    思い出したい出来事やタグを入力してください。
                  </p>
                )}
              {!diariesQuery.isLoading &&
                !diariesQuery.isError &&
                debouncedQuery &&
                results.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    一致する日記はありません。
                  </p>
                )}
              {visibleResults.map(({ diary }, index) => (
                <div key={diary.id}>
                  <Button
                    id={`${resultsId}-${index}`}
                    role="option"
                    aria-selected={canOpenResult && index === selectedIndex}
                    type="button"
                    variant="ghost"
                    disabled={!canOpenResult}
                    onFocus={() => setSelectedIndex(index)}
                    onClick={() => openDiary(diary)}
                    className={cn(
                      "h-auto w-full flex-col items-stretch justify-start gap-0 px-3 py-3 text-left font-normal whitespace-normal",
                      canOpenResult &&
                        index === selectedIndex &&
                        "bg-accent text-accent-foreground",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-medium">{diary.title}</span>
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {format(diary.date.toDate(), "yyyy年M月d日")}
                      </time>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      <DiaryMarkdown variant="excerpt">
                        {diary.content}
                      </DiaryMarkdown>
                    </p>
                  </Button>
                  {index < visibleResults.length - 1 && (
                    <Separator className="bg-border/60" />
                  )}
                </div>
              ))}
              {results.length > 50 && (
                <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
                  {results.length}件中50件を表示しています。
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
