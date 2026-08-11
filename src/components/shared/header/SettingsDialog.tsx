import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { themeOptions, type THemeKey } from "@/constants/themes";
import { usePrimaryColor } from "@/hooks/usePrimaryColor";
import useTheme from "@/hooks/useTheme";
import { UserMemoryClient } from "@/lib/service/userMemoryClient";
import { cn } from "@/lib/utils";
import type {
  ActiveUserMemoryContext,
  MemoryFact,
  PersonMemory,
  UserMemoryFact,
  UserProfileMemoryFact,
} from "@/types/memory";
import {
  Brain,
  Check,
  Monitor,
  Moon,
  Palette,
  Pencil,
  Settings,
  Sun,
  SunMoon,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  MemoryEditDialog,
  type EditableMemory,
  type MemoryEditValues,
} from "./MemoryEditDialog";

type Props = {
  uid?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SettingsSection = "general" | "memory";

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} satisfies Record<THemeKey, typeof Sun>;

const profileKeyLabels: Record<UserProfileMemoryFact["key"], string> = {
  displayName: "名前",
  ageRange: "年齢層",
  gender: "性別",
  occupation: "職業",
  location: "生活圏",
  familyStatus: "家族構成",
};

const compactLines = (value: string) =>
  Array.from(
    new Set(
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  );

export const SettingsDialog = ({ uid, open, onOpenChange }: Props) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("general");
  const [memory, setMemory] = useState<ActiveUserMemoryContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableMemory | null>(null);
  const [deletingItem, setDeletingItem] = useState<EditableMemory | null>(null);
  const { theme, setTheme } = useTheme();
  const {
    primaryColor,
    primaryColorOptions,
    handlePrimaryColorChange,
    isSavingPrimaryColor,
  } = usePrimaryColor(uid ?? "");

  const fetchMemory = useCallback(async () => {
    if (!uid) return;
    setIsLoading(true);
    setHasError(false);
    try {
      setMemory(await UserMemoryClient.getActiveMemoryContext(uid));
    } catch (error) {
      console.error("Failed to fetch memory settings", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (open && activeSection === "memory") {
      void fetchMemory();
      return;
    }
    if (!open) {
      setMemory(null);
      setActiveSection("general");
    }
  }, [activeSection, fetchMemory, open]);

  const handleThemeChange = (nextTheme: THemeKey) => {
    if (nextTheme === theme) return;
    setTheme(nextTheme);
    if (nextTheme === "light") {
      toast("ライトテーマに設定しました", { icon: <Sun /> });
    } else if (nextTheme === "dark") {
      toast("ダークテーマに設定しました", { icon: <Moon /> });
    } else {
      toast("システム設定のテーマを使用します");
    }
  };

  const saveItem = async (values: MemoryEditValues) => {
    if (!uid || !editingItem) return;
    setIsSubmitting(true);
    try {
      if (editingItem.kind === "profile") {
        await UserMemoryClient.updateProfileFact(uid, {
          ...editingItem.fact,
          value: values.value.trim(),
        });
      } else if (editingItem.kind === "preference") {
        await UserMemoryClient.updatePreference(uid, {
          ...editingItem.fact,
          value: values.value.trim(),
        });
      } else {
        const previous = editingItem.person;
        const toFacts = (lines: string, current: MemoryFact[]) =>
          compactLines(lines).map((value, index) => ({
            value,
            confidence: current[index]?.confidence ?? 1,
          }));
        const relationship = values.relationship.trim();
        await UserMemoryClient.updatePerson(uid, {
          ...previous,
          name: values.name.trim(),
          aliases: values.aliases
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          relationshipToUser: relationship
            ? {
                value: relationship,
                confidence: previous.relationshipToUser?.confidence ?? 1,
              }
            : undefined,
          attributes: toFacts(values.attributes, previous.attributes),
          relationshipNotes: toFacts(values.notes, previous.relationshipNotes),
        });
      }
      toast.success("メモリを更新しました");
      setEditingItem(null);
      await fetchMemory();
    } catch (error) {
      console.error("Failed to update memory", error);
      toast.error("メモリの更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async () => {
    if (!uid || !deletingItem) return;
    setIsSubmitting(true);
    try {
      if (deletingItem.kind === "profile")
        await UserMemoryClient.deleteProfileFact(uid, deletingItem.fact.id);
      else if (deletingItem.kind === "preference")
        await UserMemoryClient.deletePreference(uid, deletingItem.fact.id);
      else await UserMemoryClient.deletePerson(uid, deletingItem.person.id);
      toast.success("メモリを削除しました");
      setDeletingItem(null);
      await fetchMemory();
    } catch (error) {
      console.error("Failed to delete memory", error);
      toast.error("メモリの削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actions = (item: EditableMemory) => (
    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${item.label}を編集`}
        onClick={() => setEditingItem(item)}
      >
        <Pencil />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${item.label}を削除`}
        className="text-destructive"
        onClick={() => setDeletingItem(item)}
      >
        <Trash2 />
      </Button>
    </div>
  );

  const hasContent = Boolean(
    memory &&
    (memory.profileFacts.length ||
      memory.preferences.length ||
      memory.people.length),
  );

  const handleSectionChange = (section: string) => {
    if (section === "general" || section === "memory") {
      setActiveSection(section);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex h-[min(720px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            titleRef.current?.focus();
          }}
        >
          <DialogHeader className="shrink-0 border-b px-5 py-5 text-left sm:px-6">
            <DialogTitle ref={titleRef} tabIndex={-1}>
              設定
            </DialogTitle>
            <DialogDescription className="sr-only">
              表示とメモリに関する設定を変更できます。
            </DialogDescription>
          </DialogHeader>
          <Tabs
            value={activeSection}
            onValueChange={handleSectionChange}
            className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:grid-rows-1"
          >
            <nav
              aria-label="設定カテゴリー"
              className="shrink-0 overflow-x-auto overscroll-x-contain border-b [scrollbar-width:none] sm:min-h-0 sm:overflow-x-hidden sm:overflow-y-auto sm:border-r sm:border-b-0 sm:bg-muted/30 sm:p-4 [&::-webkit-scrollbar]:hidden"
            >
              <TabsList
                className="h-auto min-w-max justify-start rounded-none bg-transparent px-3 py-0 sm:w-full sm:min-w-0 sm:flex-col sm:gap-1 sm:p-0"
                aria-label="設定カテゴリー"
              >
                <TabsTrigger
                  value="general"
                  className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
                >
                  <Settings className="size-4" />
                  一般
                </TabsTrigger>
                <TabsTrigger
                  value="memory"
                  className="relative h-14 flex-none justify-start rounded-none px-3 text-muted-foreground shadow-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:h-10 sm:w-full sm:rounded-md sm:after:hidden sm:hover:bg-accent sm:hover:text-accent-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:shadow-sm"
                >
                  <Brain className="size-4" />
                  メモリ
                </TabsTrigger>
              </TabsList>
            </nav>
            <section className="flex min-h-0 min-w-0 flex-col">
              <TabsContent
                value="general"
                className="m-0 flex min-h-0 flex-1 flex-col"
              >
                <div className="shrink-0 border-b px-5 py-4 sm:px-6">
                  <h2 className="text-lg font-semibold">一般</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    表示に関する設定を変更できます。
                  </p>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-8 px-5 py-5 sm:px-6">
                    <section>
                      <div className="flex items-center gap-2">
                        <SunMoon className="size-4" />
                        <h3 className="text-sm font-semibold">テーマ</h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        画面の明るさを選択します。
                      </p>
                      <div
                        className="mt-3 grid grid-cols-3 gap-2"
                        role="radiogroup"
                        aria-label="テーマ"
                      >
                        {themeOptions.map((option) => {
                          const ThemeIcon = themeIcons[option.key];
                          const isActive = theme === option.key;
                          return (
                            <Button
                              key={option.key}
                              type="button"
                              variant="outline"
                              role="radio"
                              aria-checked={isActive}
                              className={cn(
                                "h-auto min-w-0 flex-col gap-1.5 px-2 py-3 shadow-none",
                                isActive &&
                                  "border-primary bg-accent text-accent-foreground",
                              )}
                              onClick={() => handleThemeChange(option.key)}
                            >
                              <ThemeIcon className="size-4" />
                              <span className="truncate">{option.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </section>
                    <section className="border-t pt-6">
                      <div className="flex items-center gap-2">
                        <Palette className="size-4" />
                        <h3 className="text-sm font-semibold">
                          プライマリカラー
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        ボタンや選択状態に使う色を選択します。
                      </p>
                      <div
                        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
                        role="radiogroup"
                        aria-label="プライマリカラー"
                      >
                        {primaryColorOptions.map((option) => {
                          const isActive = primaryColor === option.key;
                          return (
                            <Button
                              key={option.key}
                              type="button"
                              variant="outline"
                              role="radio"
                              aria-checked={isActive}
                              disabled={isSavingPrimaryColor}
                              className={cn(
                                "h-auto min-w-0 justify-start px-3 py-3 shadow-none",
                                isActive &&
                                  "border-primary bg-accent text-accent-foreground",
                              )}
                              onClick={() =>
                                void handlePrimaryColorChange(option.key)
                              }
                            >
                              <span
                                className={cn(
                                  "size-3 shrink-0 rounded-full border border-border",
                                  option.previewClassName,
                                )}
                              />
                              <span className="truncate">{option.label}</span>
                              {isActive && (
                                <Check className="ml-auto size-4 shrink-0" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent
                value="memory"
                className="m-0 flex min-h-0 flex-1 flex-col"
              >
                <div className="shrink-0 border-b px-5 py-4 sm:px-6">
                  <h2 className="text-lg font-semibold">メモリ</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    内容を編集するか、不要な項目を削除できます。
                  </p>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-6 px-5 py-5 sm:px-6">
                    {isLoading && (
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                      </div>
                    )}
                    {!isLoading && hasError && (
                      <p className="text-sm text-destructive">
                        メモリの取得に失敗しました。
                      </p>
                    )}
                    {!isLoading && !hasError && !hasContent && (
                      <p className="text-sm text-muted-foreground">
                        表示できるメモリはまだありません。
                      </p>
                    )}
                    {memory?.profileFacts.length ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold">ユーザー属性</h3>
                        <div className="divide-y rounded-md border">
                          {memory.profileFacts.map((fact) => {
                            const item: EditableMemory = {
                              kind: "profile",
                              fact,
                              label: profileKeyLabels[fact.key],
                            };
                            return (
                              <div
                                key={fact.id}
                                className="flex items-center gap-4 px-4 py-2"
                              >
                                <div className="min-w-0 flex-1 text-sm">
                                  <span className="text-muted-foreground">
                                    {item.label}
                                  </span>
                                  <p className="break-words">{fact.value}</p>
                                </div>
                                {actions(item)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {memory?.preferences.length ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold">好み</h3>
                        <div className="divide-y rounded-md border">
                          {memory.preferences.map((fact: UserMemoryFact) => {
                            const item: EditableMemory = {
                              kind: "preference",
                              fact,
                              label: "好み",
                            };
                            return (
                              <div
                                key={fact.id}
                                className="flex items-center gap-4 px-4 py-2"
                              >
                                <p className="min-w-0 flex-1 text-sm break-words">
                                  {fact.value}
                                </p>
                                {actions(item)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {memory?.people.length ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold">登場人物</h3>
                        <div className="space-y-2">
                          {memory.people.map((person: PersonMemory) => {
                            const item: EditableMemory = {
                              kind: "person",
                              person,
                              label: person.name,
                            };
                            return (
                              <div
                                key={person.id}
                                className="flex items-start gap-4 rounded-md border px-4 py-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium">{person.name}</p>
                                  {person.relationshipToUser && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {person.relationshipToUser.value}
                                    </p>
                                  )}
                                  <p className="mt-1 line-clamp-2 text-sm">
                                    {[
                                      ...person.attributes,
                                      ...person.relationshipNotes,
                                    ]
                                      .map((fact) => fact.value)
                                      .join("・")}
                                  </p>
                                </div>
                                {actions(item)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </ScrollArea>
              </TabsContent>
            </section>
          </Tabs>
        </DialogContent>
      </Dialog>
      <MemoryEditDialog
        item={editingItem}
        isSubmitting={isSubmitting}
        onOpenChange={(next) => !next && setEditingItem(null)}
        onSubmit={saveItem}
      />
      <Dialog
        open={deletingItem !== null}
        onOpenChange={(next) => !next && !isSubmitting && setDeletingItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>メモリを削除しますか？</DialogTitle>
            <DialogDescription>
              {`「${deletingItem?.label ?? ""}」を削除します。今後の日記から同じ内容を再学習する場合があります。`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              disabled={isSubmitting}
              onClick={() => setDeletingItem(null)}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 sm:flex-none"
              disabled={isSubmitting}
              onClick={() => void deleteItem()}
            >
              {isSubmitting ? "削除中…" : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
