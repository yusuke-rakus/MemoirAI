import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { UserMemoryClient } from "@/lib/service/userMemoryClient";
import type { ActiveUserMemoryContext, MemoryFact } from "@/types/memory";

import type { EditableMemory, MemoryEditValues } from "./MemoryEditDialog";

const compactLines = (value: string) =>
  Array.from(
    new Set(
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  );

type UseMemorySettingsOptions = {
  uid?: string;
  isActive: boolean;
};

export const useMemorySettings = ({
  uid,
  isActive,
}: UseMemorySettingsOptions) => {
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
    if (isActive) {
      void fetchMemory();
    }
  }, [fetchMemory, isActive]);

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
      if (deletingItem.kind === "profile") {
        await UserMemoryClient.deleteProfileFact(uid, deletingItem.fact.id);
      } else if (deletingItem.kind === "preference") {
        await UserMemoryClient.deletePreference(uid, deletingItem.fact.id);
      } else {
        await UserMemoryClient.deletePerson(uid, deletingItem.person.id);
      }
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

  return {
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
  };
};
