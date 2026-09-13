import {
  BookOpen,
  Check,
  Code2,
  Monitor,
  Moon,
  Palette,
  Sun,
  SunMoon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { type THemeKey, themeOptions } from "@/constants/themes";
import { LegalLinks } from "@/features/legal/components/LegalLinks";
import { useMarkdownEditorSetting } from "@/hooks/useMarkdownEditorSetting";
import { usePrimaryColor } from "@/hooks/usePrimaryColor";
import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type GeneralSettingsSectionProps = {
  uid?: string;
};

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} satisfies Record<THemeKey, typeof Sun>;

export const GeneralSettingsSection = ({
  uid,
}: GeneralSettingsSectionProps) => {
  const { theme, setTheme } = useTheme();
  const {
    markdownEditorEnabled,
    setMarkdownEditorEnabled,
    isSavingMarkdownEditorSetting,
  } = useMarkdownEditorSetting();
  const {
    primaryColor,
    primaryColorOptions,
    handlePrimaryColorChange,
    isSavingPrimaryColor,
  } = usePrimaryColor(uid ?? "");

  const handleThemeChange = (nextTheme: THemeKey) => {
    if (nextTheme === theme) return;
    setTheme(nextTheme);
    if (nextTheme === "light") {
      toast("ライトテーマに設定しました", { icon: <Sun /> });
    } else if (nextTheme === "dark") {
      toast("ダークテーマに設定しました", { icon: <Moon /> });
    } else {
      toast("システム設定のテーマを使用します");
    }
  };

  return (
    <TabsContent value="general" className="m-0 flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">一般</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          表示に関する設定を変更できます。
        </p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-8 px-5 py-5 sm:px-6">
          <section>
            <div className="flex items-center gap-2">
              <SunMoon className="size-4" />
              <h3 className="text-sm font-semibold">テーマ</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              画面の明るさを選択します。
            </p>
            <div
              className="mt-3 grid grid-cols-3 gap-2"
              role="radiogroup"
              aria-label="テーマ"
            >
              {themeOptions.map((option) => {
                const ThemeIcon = themeIcons[option.key];
                const isActive = theme === option.key;
                return (
                  <Button
                    key={option.key}
                    type="button"
                    variant="outline"
                    role="radio"
                    aria-checked={isActive}
                    className={cn(
                      "h-auto min-w-0 flex-col gap-1.5 px-2 py-3 shadow-none",
                      isActive &&
                        "border-primary bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleThemeChange(option.key)}
                  >
                    <ThemeIcon className="size-4" />
                    <span className="truncate">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </section>
          <section className="border-t pt-6">
            <div className="flex items-center gap-2">
              <Code2 className="size-4" />
              <h3 className="text-sm font-semibold">Markdownエディタ</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              日記の作成・編集画面で入力とプレビューの切り替えを表示します。
            </p>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-md border px-3 py-2.5">
              <Label
                htmlFor="markdown-editor-enabled"
                className="flex flex-col items-start gap-1"
              >
                <span>Markdownエディタを表示</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {markdownEditorEnabled ? "オン" : "オフ"}
                </span>
              </Label>
              <Switch
                id="markdown-editor-enabled"
                checked={markdownEditorEnabled}
                disabled={isSavingMarkdownEditorSetting || !uid}
                onCheckedChange={(checked) =>
                  void setMarkdownEditorEnabled(checked)
                }
              />
            </div>
          </section>
          <section className="border-t pt-6">
            <div className="flex items-center gap-2">
              <Palette className="size-4" />
              <h3 className="text-sm font-semibold">プライマリカラー</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              ボタンや選択状態に使う色を選択します。
            </p>
            <div
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label="プライマリカラー"
            >
              {primaryColorOptions.map((option) => {
                const isActive = primaryColor === option.key;
                return (
                  <Button
                    key={option.key}
                    type="button"
                    variant="outline"
                    role="radio"
                    aria-checked={isActive}
                    disabled={isSavingPrimaryColor}
                    className={cn(
                      "h-auto min-w-0 justify-start px-3 py-3 shadow-none",
                      isActive &&
                        "border-primary bg-accent text-accent-foreground",
                    )}
                    onClick={() => void handlePrimaryColorChange(option.key)}
                  >
                    <span
                      className={cn(
                        "size-3 shrink-0 rounded-full border border-border",
                        option.previewClassName,
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                    {isActive && <Check className="ml-auto size-4 shrink-0" />}
                  </Button>
                );
              })}
            </div>
          </section>
          <section className="border-t pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4" />
              <h3 className="text-sm font-semibold">利用規約</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              プライバシーポリシーとAIデータ利用方針も確認できます。
            </p>
            <LegalLinks
              target="_blank"
              className="mt-3 flex-col gap-2"
              linkClassName="w-fit text-sm text-primary"
            />
          </section>
        </div>
      </ScrollArea>
    </TabsContent>
  );
};
