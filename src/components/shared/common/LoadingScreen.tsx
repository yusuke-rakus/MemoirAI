import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  title?: string;
  description?: string;
  variant?: "page" | "section";
  className?: string;
};

export const LoadingScreen = ({
  title = "読み込み中...",
  description = "しばらくお待ちください",
  variant = "section",
  className,
}: LoadingScreenProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex w-full items-center justify-center px-4",
        variant === "page"
          ? "min-h-screen h-dvh w-screen"
          : "min-h-[44vh] py-10",
        className,
      )}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Spinner className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};
