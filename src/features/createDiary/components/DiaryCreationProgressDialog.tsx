import { CloudUpload, Image, type LucideIcon, Tags } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ShinyText } from "@/components/ui/shiny-text";
import { cn } from "@/lib/utils";

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
      {isActive ? (
        <ShinyText text={labels[status]} speed={2} delay={1} />
      ) : (
        <span className="leading-6">{labels[status]}</span>
      )}
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
                  pending: "タイトルとタグを生成",
                  active: "タイトルとタグを生成中",
                  complete: "タイトルとタグを生成しました",
                }}
              />

              {progress.illustration && (
                <ProgressStep
                  status={progress.illustration}
                  icon={Image}
                  labels={{
                    pending: "イラストを生成",
                    active: "イラストを生成中",
                    complete: "イラストを生成しました",
                  }}
                />
              )}

              <ProgressStep
                status={progress.persistence}
                icon={CloudUpload}
                labels={{
                  pending: "日記を保存",
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
