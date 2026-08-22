import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { DiarySaveMode } from "../types";

type CreatePhase = "idle" | "generating" | "saving";

type DiarySaveButtonProps = {
  saveMode: DiarySaveMode;
  createPhase: CreatePhase;
  onSaveModeChange: (saveMode: DiarySaveMode) => void;
  onSave: () => void;
};

const isDiarySaveMode = (value: string): value is DiarySaveMode =>
  value === "standard" || value === "illustrated";

const getSaveButtonLabel = (
  saveMode: DiarySaveMode,
  createPhase: CreatePhase,
) => {
  if (createPhase === "generating") return "画像を生成中...";
  if (createPhase === "saving") return "保存中...";

  return saveMode === "illustrated" ? "絵日記で保存" : "保存";
};

export const DiarySaveButton = ({
  saveMode,
  createPhase,
  onSaveModeChange,
  onSave,
}: DiarySaveButtonProps) => {
  const isCreating = createPhase !== "idle";
  const label = getSaveButtonLabel(saveMode, createPhase);

  return (
    <div className="flex items-stretch rounded-md shadow-sm">
      <Button
        type="button"
        onClick={onSave}
        disabled={isCreating}
        className="h-10 rounded-r-none px-5 font-medium shadow-none transition-all active:scale-[0.98]"
      >
        <span aria-live="polite">{label}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            disabled={isCreating}
            aria-label="保存方法を選択"
            className="h-10 w-10 rounded-l-none border-l border-primary-foreground/20 px-0 shadow-none"
          >
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-1.5">
          <DropdownMenuRadioGroup
            value={saveMode}
            onValueChange={(value) => {
              if (isDiarySaveMode(value)) onSaveModeChange(value);
            }}
          >
            <DropdownMenuRadioItem
              value="standard"
              indicator="check"
              className="items-start py-2.5"
            >
              <span className="space-y-0.5">
                <span className="block font-medium">通常保存</span>
                <span className="block text-xs text-muted-foreground">
                  画像を生成せず保存
                </span>
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="illustrated"
              indicator="check"
              className="items-start py-2.5"
            >
              <span className="space-y-0.5">
                <span className="block font-medium">絵日記で保存</span>
                <span className="block text-xs text-muted-foreground">
                  本文から水彩イラストを生成
                </span>
              </span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
