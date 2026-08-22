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
import { tagBgMap } from "@/constants/tagColors";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { cn } from "@/lib/utils";
import { DiaryClient } from "@/lib/service/diaryClient";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import type { Diary } from "@/types/diary/diary";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  appendSearchTerm,
  getFrequentTags,
  searchDiaries,
} from "../lib/diarySearch";

export const DiarySearchDialog = () => {
  const navigate = useNavigate();
  const { localUser } = useLocalUser();
  const { open, cachedUid, diaries, setOpen, setCache } = useDiarySearchStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open || !localUser.uid || cachedUid === localUser.uid) return;
    let active = true;
    setIsLoading(true);
    setHasError(false);
    void DiaryClient.getByUid<Diary>(localUser.uid)
      .then((result) => {
        if (active) {
          setIsLoading(false);
          setCache(localUser.uid, result ?? []);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch diaries for search", error);
        if (active) {
          setHasError(true);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [cachedUid, localUser.uid, open, setCache]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setOpen]);

  const cachedDiaries = useMemo(
    () => (cachedUid === localUser.uid ? diaries : []),
    [cachedUid, diaries, localUser.uid],
  );
  const frequentTags = useMemo(
    () => (open ? getFrequentTags(cachedDiaries) : []),
    [cachedDiaries, open],
  );
  const results = useMemo(
    () => searchDiaries(cachedDiaries, debouncedQuery),
    [cachedDiaries, debouncedQuery],
  );
  const visibleResults = results.slice(0, 50);

  const openDiary = (diary: Diary) => {
    setOpen(false);
    setQuery("");
    navigate(
      `/diaries/${format(diary.date.toDate(), "yyyy-MM-dd")}#diary-${diary.id}`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle>日記を検索</DialogTitle>
          <DialogDescription>
            タイトル、本文、タグからすべての日記を検索します。
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="キーワードを入力"
            aria-label="日記の検索キーワード"
            className="border-0 px-0 shadow-none focus-visible:ring-0"
          />
          <kbd className="hidden rounded border bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </div>
        {frequentTags.length > 0 && (
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
        <ScrollArea className="h-[min(60vh,480px)]">
          <div className="p-3" role="list" aria-label="検索結果">
            {isLoading && !query && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                日記を読み込んでいます…
              </p>
            )}
            {!isLoading && hasError && (
              <p className="p-6 text-center text-sm text-destructive">
                日記を読み込めませんでした。ダイアログを開き直してください。
              </p>
            )}
            {!isLoading && !hasError && !debouncedQuery && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                思い出したい出来事やタグを入力してください。
              </p>
            )}
            {!isLoading &&
              !hasError &&
              debouncedQuery &&
              results.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  一致する日記はありません。
                </p>
              )}
            {visibleResults.map(({ diary }, index) => (
              <div key={diary.id} role="listitem">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => openDiary(diary)}
                  className="h-auto w-full flex-col items-stretch justify-start gap-0 px-3 py-3 text-left font-normal whitespace-normal"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium">{diary.title}</span>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {format(diary.date.toDate(), "yyyy年M月d日")}
                    </time>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {diary.content}
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
      </DialogContent>
    </Dialog>
  );
};
