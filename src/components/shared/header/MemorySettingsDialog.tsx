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
import { UserMemoryClient } from "@/lib/service/userMemoryClient";
import type {
  ActiveUserMemoryContext,
  MemoryFact,
  PersonMemory,
  UserMemoryFact,
  UserProfileMemoryFact,
} from "@/types/memory";
import { Brain, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type EditableMemory,
  MemoryEditDialog,
  type MemoryEditValues,
} from "./MemoryEditDialog";

type Props = { uid?: string; open: boolean; onOpenChange: (open: boolean) => void };

const profileKeyLabels: Record<UserProfileMemoryFact["key"], string> = {
  displayName: "名前",
  ageRange: "年齢層",
  gender: "性別",
  occupation: "職業",
  location: "生活圏",
  familyStatus: "家族構成",
};

const compactLines = (value: string) =>
  Array.from(new Set(value.split("\n").map((line) => line.trim()).filter(Boolean)));

export const MemorySettingsDialog = ({ uid, open, onOpenChange }: Props) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [memory, setMemory] = useState<ActiveUserMemoryContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableMemory | null>(null);
  const [deletingItem, setDeletingItem] = useState<EditableMemory | null>(null);

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
    if (open) void fetchMemory();
    else setMemory(null);
  }, [fetchMemory, open]);

  const saveItem = async (values: MemoryEditValues) => {
    if (!uid || !editingItem) return;
    setIsSubmitting(true);
    try {
      if (editingItem.kind === "profile") {
        await UserMemoryClient.updateProfileFact(uid, { ...editingItem.fact, value: values.value.trim() });
      } else if (editingItem.kind === "preference") {
        await UserMemoryClient.updatePreference(uid, { ...editingItem.fact, value: values.value.trim() });
      } else {
        const previous = editingItem.person;
        const toFacts = (lines: string, current: MemoryFact[]) =>
          compactLines(lines).map((value, index) => ({ value, confidence: current[index]?.confidence ?? 1 }));
        const relationship = values.relationship.trim();
        await UserMemoryClient.updatePerson(uid, {
          ...previous,
          name: values.name.trim(),
          aliases: values.aliases.split(",").map((value) => value.trim()).filter(Boolean),
          relationshipToUser: relationship
            ? { value: relationship, confidence: previous.relationshipToUser?.confidence ?? 1 }
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
      if (deletingItem.kind === "profile") await UserMemoryClient.deleteProfileFact(uid, deletingItem.fact.id);
      else if (deletingItem.kind === "preference") await UserMemoryClient.deletePreference(uid, deletingItem.fact.id);
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
      <Button type="button" variant="ghost" size="icon" aria-label={`${item.label}を編集`} onClick={() => setEditingItem(item)}><Pencil /></Button>
      <Button type="button" variant="ghost" size="icon" aria-label={`${item.label}を削除`} className="text-destructive" onClick={() => setDeletingItem(item)}><Trash2 /></Button>
    </div>
  );

  const hasContent = Boolean(memory && (memory.profileFacts.length || memory.preferences.length || memory.people.length));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[min(720px,calc(100vh-2rem))] gap-0 overflow-hidden p-0 sm:max-w-3xl" onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus(); }}>
          <DialogHeader className="sr-only">
            <DialogTitle ref={titleRef} tabIndex={-1}>メモリ設定</DialogTitle>
            <DialogDescription>保存されているメモリを編集または削除できます。</DialogDescription>
          </DialogHeader>
          <div className="grid min-h-[560px] grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
            <aside className="border-b bg-muted/30 p-4 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm"><Brain className="size-4 text-primary" />メモリ</div>
            </aside>
            <section className="min-w-0">
              <div className="border-b px-6 py-4"><h2 className="text-lg font-semibold">メモリ</h2><p className="mt-1 text-sm text-muted-foreground">内容を編集するか、不要な項目を削除できます。</p></div>
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 px-6 py-5">
                  {isLoading && <div className="space-y-3"><Skeleton className="h-5 w-28" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div>}
                  {!isLoading && hasError && <p className="text-sm text-destructive">メモリの取得に失敗しました。</p>}
                  {!isLoading && !hasError && !hasContent && <p className="text-sm text-muted-foreground">表示できるメモリはまだありません。</p>}
                  {memory?.profileFacts.length ? <div className="space-y-2"><h3 className="text-sm font-semibold">ユーザー属性</h3><div className="divide-y rounded-md border">{memory.profileFacts.map((fact) => { const item: EditableMemory = { kind: "profile", fact, label: profileKeyLabels[fact.key] }; return <div key={fact.id} className="flex items-center gap-4 px-4 py-2"><div className="min-w-0 flex-1 text-sm"><span className="text-muted-foreground">{item.label}</span><p className="break-words">{fact.value}</p></div>{actions(item)}</div>; })}</div></div> : null}
                  {memory?.preferences.length ? <div className="space-y-2"><h3 className="text-sm font-semibold">好み</h3><div className="divide-y rounded-md border">{memory.preferences.map((fact: UserMemoryFact) => { const item: EditableMemory = { kind: "preference", fact, label: "好み" }; return <div key={fact.id} className="flex items-center gap-4 px-4 py-2"><p className="min-w-0 flex-1 break-words text-sm">{fact.value}</p>{actions(item)}</div>; })}</div></div> : null}
                  {memory?.people.length ? <div className="space-y-2"><h3 className="text-sm font-semibold">登場人物</h3><div className="space-y-2">{memory.people.map((person: PersonMemory) => { const item: EditableMemory = { kind: "person", person, label: person.name }; return <div key={person.id} className="flex items-start gap-4 rounded-md border px-4 py-3"><div className="min-w-0 flex-1"><p className="font-medium">{person.name}</p>{person.relationshipToUser && <p className="mt-1 text-sm text-muted-foreground">{person.relationshipToUser.value}</p>}<p className="mt-1 line-clamp-2 text-sm">{[...person.attributes, ...person.relationshipNotes].map((fact) => fact.value).join("・")}</p></div>{actions(item)}</div>; })}</div></div> : null}
                </div>
              </ScrollArea>
            </section>
          </div>
        </DialogContent>
      </Dialog>
      <MemoryEditDialog item={editingItem} isSubmitting={isSubmitting} onOpenChange={(next) => !next && setEditingItem(null)} onSubmit={saveItem} />
      <Dialog open={deletingItem !== null} onOpenChange={(next) => !next && !isSubmitting && setDeletingItem(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>メモリを削除しますか？</DialogTitle><DialogDescription>「{deletingItem?.label}」を削除します。今後の日記から同じ内容を再学習する場合があります。</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setDeletingItem(null)}>キャンセル</Button><Button type="button" variant="destructive" disabled={isSubmitting} onClick={() => void deleteItem()}>{isSubmitting ? "削除中…" : "削除する"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </>
  );
};
