import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CloudUpload, Image, Tags, type LucideIcon } from "lucide-react";
import type { DiaryCreationProgress, DiaryCreationStepStatus } from "../types";

type DiaryCreationProgressDialogProps = {
  progress: DiaryCreationProgress | null;
};

type ProgressStepProps = {
  status: DiaryCreationStepStatus;
  icon: LucideIcon;
  labels: Record<DiaryCreationStepStatus, string>;
};

const ProgressStep = ({ status, icon: Icon, labels }: ProgressStepProps) => {
  const isActive = status === "active";

  return (
    <li
      data-status={status}
      className={cn(
        "flex items-center gap-2.5 py-2 text-sm transition-colors motion-reduce:transition-none",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span
        className={cn(
          "leading-6",
          isActive &&
            "animate-loader-shimmer bg-gradient-to-r from-primary via-primary/15 to-primary bg-[length:240%_100%] bg-clip-text font-normal text-transparent drop-shadow-[0_0_8px_color-mix(in_oklab,var(--color-primary)_30%,transparent)] motion-reduce:animate-none motion-reduce:bg-none motion-reduce:text-primary motion-reduce:drop-shadow-none",
        )}
      >
        {labels[status]}
      </span>
    </li>
  );
};

export const DiaryCreationProgressDialog = ({
  progress,
}: DiaryCreationProgressDialogProps) => {
  const isOpen = progress !== null;

  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-5 [&>button]:hidden"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">日記を作成中</DialogTitle>
        <div role="status" aria-live="polite" aria-busy={isOpen}>
          {progress && (
            <ol className="space-y-1">
              <ProgressStep
                status={progress.metadata}
                icon={Tags}
                labels={{
                  pending: "タイトルとタグを生成予定",
                  active: "タイトルとタグを生成中",
                  complete: "タイトルとタグを生成しました",
                }}
              />

              {progress.illustration && (
                <ProgressStep
                  status={progress.illustration}
                  icon={Image}
                  labels={{
                    pending: "水彩イラストを生成予定",
                    active: "水彩イラストを生成中",
                    complete: "水彩イラストを生成しました",
                  }}
                />
              )}

              <ProgressStep
                status={progress.persistence}
                icon={CloudUpload}
                labels={{
                  pending: "日記を保存予定",
                  active: "日記を保存中",
                  complete: "日記を保存しました",
                }}
              />
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
