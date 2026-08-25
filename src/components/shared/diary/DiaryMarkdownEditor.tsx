import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Eye, PencilLine } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { DiaryMarkdown } from "./DiaryMarkdown";

type DiaryMarkdownEditorProps = {
  children: ReactNode;
  content: string;
  className?: string;
  disabled?: boolean;
  previewClassName?: string;
  resetKey: string;
};

type EditorMode = "write" | "preview";

export const DiaryMarkdownEditor = ({
  children,
  content,
  className,
  disabled = false,
  previewClassName,
  resetKey,
}: DiaryMarkdownEditorProps) => {
  const [mode, setMode] = useState<EditorMode>("write");

  useEffect(() => {
    setMode("write");
  }, [resetKey]);

  return (
    <Tabs
      value={mode}
      onValueChange={(value) => setMode(value as EditorMode)}
      className={className}
    >
      <div className="flex items-center justify-between gap-3">
        <TabsList aria-label="本文の表示モード" className="h-8">
          <TabsTrigger value="write" disabled={disabled} className="text-xs">
            <PencilLine aria-hidden="true" />
            入力
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={disabled} className="text-xs">
            <Eye aria-hidden="true" />
            プレビュー
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="write" className="mt-0">
        {children}
      </TabsContent>
      <TabsContent value="preview" className="mt-0">
        <div
          className={cn(
            "min-h-48 overflow-auto rounded-md border bg-background px-3 py-2",
            previewClassName,
          )}
        >
          {content.trim() ? (
            <DiaryMarkdown>{content}</DiaryMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">
              プレビューする本文がありません
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
