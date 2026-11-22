import {
  CloudUpload,
  HardDrive,
  Image,
  type LucideIcon,
  Tags,
} from "lucide-react";
import type { RefObject } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ShinyText } from "@/components/ui/shiny-text";
import { cn } from "@/lib/utils";

import type { DiaryCreationProgress, DiaryCreationStepStatus } from "../types";

type DiaryCreationProgressDialogProps = {
  progress: DiaryCreationProgress | null;
  destination: "account" | "browser";
  returnFocusRef: RefObject<HTMLButtonElement | null>;
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
        isActive ? "text-foreground" : "text-muted-foreground",
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
  destination,
  returnFocusRef,
}: DiaryCreationProgressDialogProps) => {
  const isOpen = progress !== null;
  const saveDestination =
    destination === "browser" ? "このブラウザ" : "アカウント";

  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-5 [&>button]:hidden"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <DialogTitle className="text-base">日記を作成中</DialogTitle>
        <div role="status">
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
                icon={destination === "browser" ? HardDrive : CloudUpload}
                labels={{
                  pending: `${saveDestination}に保存`,
                  active: `${saveDestination}に保存中`,
                  complete: `${saveDestination}に保存しました`,
                }}
              />
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
