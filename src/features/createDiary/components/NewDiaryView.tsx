import { RotatingText } from "@/components/shared/common/RotatingText";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Plus, Save, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCreateDiary } from "../hooks/useCreateDiary";
import { useDiaryCard } from "../hooks/useDiaryCard";
import { useFetchDiary } from "../hooks/useFetchDiary";
import { usePickMessages } from "../hooks/usePickMessages";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import { DiaryPreviewCard } from "./DiaryPreviewCard";

export const NewDiaryView = () => {
  const { date, uploadedDiaries, isLoading } = useDiaryDetailStore();
  const { refetch } = useFetchDiary();
  const { isCreating, onSave } = useCreateDiary();
  const { pickRandomMessages } = usePickMessages();
  const {
    cards,
    tagInputs,
    addCard,
    removeCard,
    toggleCollapse,
    updateCardBody,
    addTag,
    removeTag,
    handleTagInputChange,
    handleTagInputKeyDown,
    reset,
  } = useDiaryCard();

  useEffect(() => {
    reset(date);
  }, [date, reset]);

  const handleSave = async () => {
    await onSave();
    await refetch();
  };

  return (
    <div className="min-h-screen pt-5">
      <div className="relative max-w-3xl mx-auto">
        <div className="mb-4 animate-slide-in-down">
          <RotatingText
            className="text-2xl font-semibold"
            text={pickRandomMessages}
          />
          <span>{date.toLocaleDateString()}</span>
        </div>

        <div className="space-y-4 mb-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={cn(
                "shadow-sm border-border gap-3",
                card.isRemoving
                  ? "animate-slide-out-up"
                  : "animate-slide-in-up transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
              )}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleCollapse(card.id)}
                    className="flex items-center gap-3 flex-1 text-left group"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform"></div>
                      <CardTitle className="text-sm font-normal text-muted-foreground group-hover:text-foreground transition-colors">
                        今日の出来事を書き留めよう ✨
                      </CardTitle>
                    </div>
                    {card.isCollapsed ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
                    )}
                  </button>
                  {cards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCard(card.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 active:scale-95"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <div
                className={cn(
                  "overflow-hidden py-1",
                  card.isCollapsed
                    ? "animate-collapse-height"
                    : "animate-expand-height"
                )}
              >
                <CardContent className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="今日あったことを書いてください..."
                      value={card.body}
                      onChange={(e) => updateCardBody(card.id, e.target.value)}
                      className="min-h-[120px] resize-none border-border transition-all duration-200 focus:border-primary focus-visible:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      タグ
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="タグを入力してEnter"
                        value={tagInputs[card.id] || ""}
                        onChange={(e) =>
                          handleTagInputChange(card.id, e.target.value)
                        }
                        onKeyDown={(e) => handleTagInputKeyDown(e, card.id)}
                        className="flex-1 border-border transition-all duration-200 focus:border-primary focus-visible:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(card.id)}
                        className="px-3 transition-all duration-200 hover:bg-muted hover:border-border active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {card.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium animate-scale-in transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(card.id, tagIndex)}
                              className="hover:bg-accent/60 rounded-full p-0.5 transition-all duration-200 active:scale-95"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-transparent bg-clip-text bg-gradient-to-r from-foreground/30 via-foreground/90 to-foreground/30 bg-[length:200%_100%] animate-loader-shimmer">
          Hello World.
        </p>

        {uploadedDiaries.length > 0 && (
          <>
            <h3 className="text-xl text-muted-foreground">今日の日記</h3>
            <div className="flex flex-col gap-2">
              {uploadedDiaries.map((diary, i) => {
                return <DiaryPreviewCard key={i} diary={diary} />;
              })}
            </div>
          </>
        )}

        <div className="w-full min-h-24" />

        <div className="fixed bottom-6 w-full max-w-3xl flex gap-3">
          <Button
            onClick={addCard}
            variant="outline"
            className="flex-1 h-11 text-sm font-medium border-2 border-border hover:bg-muted hover:border-primary hover:text-primary transition-all duration-200 active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            カードを追加
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCreating}
            className="flex-1 h-11 text-sm font-medium bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-95"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
          <Button onClick={() => toast("hello")}>no</Button>
        </div>
      </div>
    </div>
  );
};
