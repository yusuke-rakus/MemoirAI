import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { type ShortcutId, shortcutLabel, shortcuts } from "@/lib/shortcuts";

export function ShortcutSettingsSection() {
  return (
    <TabsContent value="shortcuts" className="m-0 flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">ショートカット</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          キーボードで日記の作成や検索をすばやく操作できます。
        </p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 px-5 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">
            日本語の変換中は動作しません。ダイアログやメニューを開いている間は、その画面の操作だけが使えます。
          </p>
          {["共通操作", "日記の作成・編集", "日記検索", "カレンダー"].map(
            (group) => (
              <section key={group}>
                <h3 className="mb-2 font-medium">{group}</h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  {group === "日記検索"
                    ? "検索入力欄で使用できます。"
                    : group === "カレンダー"
                      ? "矢印・Enter・Spaceは日付セルにフォーカスして使用します。Tは入力欄以外で使えます。"
                      : group === "日記の作成・編集"
                        ? "入力中も使用できます。保存中は操作できません。"
                        : "新規作成と検索は入力中も使用できます。それ以外は入力欄以外で使用します。"}
                </p>
                <dl className="divide-y">
                  {(Object.keys(shortcuts) as ShortcutId[])
                    .filter((id) => shortcuts[id].group === group)
                    .map((id) => (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-3 py-3 text-sm"
                      >
                        <dt>{shortcuts[id].label}</dt>
                        <dd>
                          <kbd className="rounded border bg-muted px-2 py-1 text-xs whitespace-nowrap">
                            {shortcutLabel(id)}
                          </kbd>
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            ),
          )}
        </div>
      </ScrollArea>
    </TabsContent>
  );
}
