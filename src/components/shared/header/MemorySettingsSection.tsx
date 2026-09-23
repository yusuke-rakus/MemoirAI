import { Pencil, Trash2 } from "lucide-react";

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
import { TabsContent } from "@/components/ui/tabs";
import type {
  PersonMemory,
  UserMemoryFact,
  UserProfileMemoryFact,
} from "@/types/memory";

import { type EditableMemory, MemoryEditDialog } from "./MemoryEditDialog";
import { useMemorySettings } from "./useMemorySettings";

type MemorySettingsSectionProps = {
  uid?: string;
  isActive: boolean;
};

const profileKeyLabels: Record<UserProfileMemoryFact["key"], string> = {
  displayName: "名前",
  ageRange: "年齢層",
  gender: "性別",
  occupation: "職業",
  location: "生活圏",
  familyStatus: "家族構成",
};

export const MemorySettingsSection = ({
  uid,
  isActive,
}: MemorySettingsSectionProps) => {
  const {
    memory,
    isLoading,
    isSubmitting,
    hasError,
    editingItem,
    deletingItem,
    setEditingItem,
    setDeletingItem,
    saveItem,
    deleteItem,
  } = useMemorySettings({ uid, isActive });

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
        className="text-destructive hover:text-destructive"
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

  return (
    <>
      <TabsContent value="memory" className="m-0 flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold">メモリ</h2>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 px-5 py-5 sm:px-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              日記からAIが抽出した情報です。今後のタイトルやタグなどの生成に使われます。誤った内容は編集・削除できます。削除しても、今後の日記から同じ内容が再び抽出される場合があります。
            </p>
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
                            {[...person.attributes, ...person.relationshipNotes]
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
