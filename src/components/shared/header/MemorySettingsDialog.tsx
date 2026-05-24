import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMemoryClient } from "@/lib/service/userMemoryClient";
import type {
  ActivePersonMemory,
  ActiveUserMemoryContext,
  MemoryFact,
  UserProfileMemoryFact,
} from "@/types/memory";
import { Brain } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MemorySettingsDialogProps = {
  uid?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type MemoryRow = {
  key: string;
  value: string;
};

type MemorySection = {
  collectionKey: keyof ActiveUserMemoryContext;
  title: string;
  rows: MemoryRow[];
};

const memoryCollectionLabels: Record<keyof ActiveUserMemoryContext, string> = {
  profileFacts: "ユーザー属性",
  preferences: "好み",
  people: "登場人物",
};

const profileKeyLabels: Record<UserProfileMemoryFact["key"], string> = {
  displayName: "名前",
  ageRange: "年齢層",
  gender: "性別",
  occupation: "職業",
  location: "生活圏",
  familyStatus: "家族構成",
};

const createPreferenceRows = (preferences: MemoryFact[]): MemoryRow[] =>
  preferences.map((preference) => ({
    key: "好み",
    value: preference.value,
  }));

const createProfileFactRows = (
  profileFacts: UserProfileMemoryFact[],
): MemoryRow[] =>
  profileFacts.map((fact) => ({
    key: profileKeyLabels[fact.key],
    value: fact.value,
  }));

const createPersonRows = (people: ActivePersonMemory[]): MemoryRow[] =>
  people.flatMap((person) => {
    const rows: MemoryRow[] = [];

    if (person.relationshipToUser) {
      rows.push({
        key: `${person.name} / 関係性`,
        value: person.relationshipToUser.value,
      });
    }

    person.attributes.forEach((attribute) => {
      rows.push({
        key: `${person.name} / 属性`,
        value: attribute.value,
      });
    });

    person.relationshipNotes.forEach((note) => {
      rows.push({
        key: `${person.name} / 関係メモ`,
        value: note.value,
      });
    });

    return rows;
  });

const createMemorySections = (
  memory: ActiveUserMemoryContext | null,
): MemorySection[] => {
  if (!memory) return [];

  const sections: MemorySection[] = [
    {
      collectionKey: "profileFacts",
      title: memoryCollectionLabels.profileFacts,
      rows: createProfileFactRows(memory.profileFacts),
    },
    {
      collectionKey: "preferences",
      title: memoryCollectionLabels.preferences,
      rows: createPreferenceRows(memory.preferences),
    },
    {
      collectionKey: "people",
      title: memoryCollectionLabels.people,
      rows: createPersonRows(memory.people),
    },
  ];

  return sections.filter((section) => section.rows.length > 0);
};

export const MemorySettingsDialog = ({
  uid,
  open,
  onOpenChange,
}: MemorySettingsDialogProps) => {
  const [memory, setMemory] = useState<ActiveUserMemoryContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!open || !uid) {
      setMemory(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    const fetchMemory = async () => {
      try {
        const memoryContext = await UserMemoryClient.getActiveMemoryContext(uid);
        if (!isMounted) return;
        setMemory(memoryContext);
      } catch (error) {
        console.error("Failed to fetch memory settings", error);
        if (!isMounted) return;
        setMemory(null);
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchMemory();

    return () => {
      isMounted = false;
    };
  }, [open, uid]);

  const sections = useMemo(() => createMemorySections(memory), [memory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(720px,calc(100vh-2rem))] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>メモリの内容を表示します</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-[560px] grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
          <aside className="border-b bg-muted/30 p-4 sm:border-b-0 sm:border-r">
            <div className="flex items-center gap-2 rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm">
              <Brain className="h-4 w-4 text-primary" />
              メモリ
            </div>
          </aside>
          <section className="min-w-0">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">メモリ</h2>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-6 px-6 py-5">
                {isLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}

                {!isLoading && hasError && (
                  <p className="text-sm text-destructive">
                    メモリの取得に失敗しました。
                  </p>
                )}

                {!isLoading && !hasError && sections.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    表示できるメモリはまだありません。
                  </p>
                )}

                {!isLoading &&
                  !hasError &&
                  sections.map((section) => (
                    <div key={section.collectionKey} className="space-y-2">
                      <h3 className="text-sm font-semibold">
                        {section.title}
                      </h3>
                      <div className="divide-y rounded-md border">
                        {section.rows.map((row, index) => (
                          <div
                            key={`${section.title}-${row.key}-${index}`}
                            className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
                          >
                            <div className="text-muted-foreground">
                              {row.key}
                            </div>
                            <div className="min-w-0 whitespace-pre-wrap break-words">
                              {row.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
