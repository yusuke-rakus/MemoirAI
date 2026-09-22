import {
  BookOpen,
  Code2,
  Monitor,
  Moon,
  Palette,
  Sun,
  SunMoon,
} from "lucide-react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import {
  getPrimaryColorOption,
  isPrimaryColorKey,
} from "@/constants/primaryColors";
import { isThemeKey, type THemeKey, themeOptions } from "@/constants/themes";
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
  const { theme, setTheme, isSavingTheme } = useTheme();
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

  const handleThemeChange = async (nextTheme: THemeKey) => {
    if (!(await setTheme(nextTheme))) return;
    if (nextTheme === "light") {
      toast("ライトテーマに設定しました", { icon: <Sun /> });
    } else if (nextTheme === "dark") {
      toast("ダークテーマに設定しました", { icon: <Moon /> });
    } else {
      toast("システム設定のテーマを使用します");
    }
  };

  const selectedPrimaryColor = getPrimaryColorOption(primaryColor);

  return (
    <TabsContent value="general" className="m-0 flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">一般</h2>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-8 px-5 py-5 sm:px-6">
          <section>
            <div className="flex items-center gap-4">
              <div className="flex shrink-0 items-center gap-2">
                <SunMoon className="size-4" />
                <h3 className="text-sm">テーマ</h3>
              </div>
              <Select
                value={theme}
                disabled={isSavingTheme || !uid}
                onValueChange={(nextTheme) => {
                  if (isThemeKey(nextTheme)) void handleThemeChange(nextTheme);
                }}
              >
                <SelectTrigger
                  id="theme"
                  className="ml-auto w-32 shrink-0 text-xs"
                  aria-label="テーマ"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => {
                    const ThemeIcon = themeIcons[option.key];
                    return (
                      <SelectItem key={option.key} value={option.key}>
                        <ThemeIcon className="size-4" />
                        {option.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </section>
          <section className="border-t pt-6">
            <div className="flex items-center gap-4">
              <div className="flex shrink-0 items-center gap-2">
                <Palette className="size-4" />
                <h3 className="text-sm">アクセントカラー</h3>
              </div>
              <Select
                value={primaryColor}
                disabled={isSavingPrimaryColor || !uid}
                onValueChange={(nextKey) => {
                  if (isPrimaryColorKey(nextKey)) {
                    void handlePrimaryColorChange(nextKey);
                  }
                }}
              >
                <SelectTrigger
                  id="primary-color"
                  className="ml-auto w-32 shrink-0 text-xs"
                  aria-label="アクセントカラー"
                >
                  <SelectValue>
                    <span
                      className={cn(
                        "size-3 shrink-0 rounded-full border border-border",
                        selectedPrimaryColor.previewClassName,
                      )}
                    />
                    {selectedPrimaryColor.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {primaryColorOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      <span
                        className={cn(
                          "size-3 shrink-0 rounded-full border border-border",
                          option.previewClassName,
                        )}
                      />
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
          <section className="border-t pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Code2 className="size-4" />
                <h3 className="text-sm">Markdownエディタ</h3>
              </div>
              <Switch
                id="markdown-editor-enabled"
                aria-label="Markdownエディタを表示"
                checked={markdownEditorEnabled}
                disabled={isSavingMarkdownEditorSetting || !uid}
                onCheckedChange={(checked) =>
                  void setMarkdownEditorEnabled(checked)
                }
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              日記の作成・編集画面で入力とプレビューの切り替えを表示します。
            </p>
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
              linkClassName="w-fit text-sm text-foreground"
            />
          </section>
        </div>
      </ScrollArea>
    </TabsContent>
  );
};
