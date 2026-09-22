import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { type ShortcutId, shortcutLabel, shortcuts } from "@/lib/shortcuts";

export function ShortcutSettingsSection() {
  return (
    <TabsContent value="shortcuts" className="m-0 flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">ショートカット</h2>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">
            日本語の変換中は使用できません。ダイアログ・メニュー表示中は、その画面内の操作のみ使えます。
          </p>
          <div className="mt-5 divide-y">
            {["共通操作", "日記の作成・編集", "日記検索", "カレンダー"].map(
              (group) => (
                <section key={group} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="mb-2 font-medium">{group}</h3>
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
        </div>
      </ScrollArea>
    </TabsContent>
  );
}
