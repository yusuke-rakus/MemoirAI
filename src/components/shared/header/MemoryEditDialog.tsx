import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  PersonMemory,
  UserMemoryFact,
  UserProfileMemoryFact,
} from "@/types/memory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type EditableMemory =
  | { kind: "profile"; fact: UserProfileMemoryFact; label: string }
  | { kind: "preference"; fact: UserMemoryFact; label: string }
  | { kind: "person"; person: PersonMemory; label: string };

const schema = z.object({
  value: z.string(),
  name: z.string(),
  aliases: z.string(),
  relationship: z.string(),
  attributes: z.string(),
  notes: z.string(),
});

export type MemoryEditValues = z.infer<typeof schema>;

type Props = {
  item: EditableMemory | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MemoryEditValues) => Promise<void>;
};

const getDefaults = (item: EditableMemory | null): MemoryEditValues => {
  if (!item) {
    return { value: "", name: "", aliases: "", relationship: "", attributes: "", notes: "" };
  }
  if (item.kind !== "person") {
    return { value: item.fact.value, name: "", aliases: "", relationship: "", attributes: "", notes: "" };
  }
  return {
    value: "",
    name: item.person.name,
    aliases: item.person.aliases.join(", "),
    relationship: item.person.relationshipToUser?.value ?? "",
    attributes: item.person.attributes.map((fact) => fact.value).join("\n"),
    notes: item.person.relationshipNotes.map((fact) => fact.value).join("\n"),
  };
};

export const MemoryEditDialog = ({ item, isSubmitting, onOpenChange, onSubmit }: Props) => {
  const form = useForm<MemoryEditValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(item),
  });

  useEffect(() => {
    if (item) form.reset(getDefaults(item));
  }, [form, item]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (item?.kind === "person" && !values.name.trim()) {
      form.setError("name", { message: "人物名を入力してください" });
      return;
    }
    if (item?.kind !== "person" && !values.value.trim()) {
      form.setError("value", { message: "内容を入力してください" });
      return;
    }
    await onSubmit(values);
  });

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item?.label ?? "メモリ"}を編集</DialogTitle>
          <DialogDescription>保存すると、今後の日記生成で使われる内容が更新されます。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {item?.kind !== "person" ? (
              <FormField control={form.control} name="value" render={({ field }) => (
                <FormItem>
                  <FormLabel>内容</FormLabel>
                  <FormControl><Textarea {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ) : (
              <>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>人物名</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="aliases" render={({ field }) => (
                  <FormItem><FormLabel>別名</FormLabel><FormControl><Input {...field} disabled={isSubmitting} placeholder="カンマ区切り" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="relationship" render={({ field }) => (
                  <FormItem><FormLabel>あなたとの関係</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="attributes" render={({ field }) => (
                  <FormItem><FormLabel>属性</FormLabel><FormControl><Textarea {...field} disabled={isSubmitting} placeholder="1行に1項目" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>関係メモ</FormLabel><FormControl><Textarea {...field} disabled={isSubmitting} placeholder="1行に1項目" /></FormControl><FormMessage /></FormItem>
                )} />
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>キャンセル</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "保存中…" : "保存する"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
