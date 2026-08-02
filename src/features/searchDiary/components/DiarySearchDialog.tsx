import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { DiaryClient } from "@/lib/service/diaryClient";
import { useDiarySearchStore } from "@/stores/diarySearchStore";
import type { Diary } from "@/types/diary/diary";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const normalize = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();

const searchDiaries = (diaries: Diary[], query: string) => {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  return diaries
    .map((diary) => {
      const title = normalize(diary.title);
      const tags = normalize(diary.tags.map((tag) => tag.name).join(" "));
      const content = normalize(diary.content);
      const matches = terms.every(
        (term) =>
          title.includes(term) || tags.includes(term) || content.includes(term),
      );
      if (!matches) return null;
      const score = terms.reduce(
        (total, term) =>
          total +
          (title.includes(term) ? 3 : 0) +
          (tags.includes(term) ? 2 : 0) +
          (content.includes(term) ? 1 : 0),
        0,
      );
      return { diary, score };
    })
    .filter((result): result is { diary: Diary; score: number } => result !== null)
    .sort(
      (a, b) =>
        b.score - a.score || b.diary.date.toMillis() - a.diary.date.toMillis(),
    );
};

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
        if (active) setCache(localUser.uid, result ?? []);
      })
      .catch((error) => {
        console.error("Failed to fetch diaries for search", error);
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
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

  const results = useMemo(
    () => searchDiaries(diaries, debouncedQuery),
    [debouncedQuery, diaries],
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
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>日記を検索</DialogTitle>
          <DialogDescription>
            タイトル、本文、タグからすべての日記を検索します。
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b px-5 py-3">
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
        <ScrollArea className="h-[min(60vh,480px)]">
          <div className="p-3" role="list" aria-label="検索結果">
            {isLoading && (
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
            {visibleResults.map(({ diary }) => (
              <div key={diary.id} role="listitem">
                <button
                  type="button"
                  onClick={() => openDiary(diary)}
                  className="w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                </button>
              </div>
            ))}
            {results.length > 50 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {results.length}件中50件を表示しています。
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
