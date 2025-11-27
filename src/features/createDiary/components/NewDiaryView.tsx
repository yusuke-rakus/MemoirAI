import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, X, Save, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiaryCard {
  id: string;
  body: string;
  tags: string[];
  isCollapsed: boolean;
  isRemoving: boolean;
}

export const NewDiaryView = () => {
  const [cards, setCards] = useState<DiaryCard[]>([
    { id: "1", body: "", tags: [], isCollapsed: false, isRemoving: false },
  ]);
  const [tagInputs, setTagInputs] = useState<{ [key: string]: string }>({
    "1": "",
  });
  const [savedAnimation, setSavedAnimation] = useState(false);

  const addCard = () => {
    const newId = Date.now().toString();
    setCards([
      ...cards,
      { id: newId, body: "", tags: [], isCollapsed: false, isRemoving: false },
    ]);
    setTagInputs({ ...tagInputs, [newId]: "" });
  };

  const removeCard = (id: string) => {
    if (cards.length > 1) {
      setCards(
        cards.map((card) =>
          card.id === id ? { ...card, isRemoving: true } : card
        )
      );

      setTimeout(() => {
        setCards(cards.filter((card) => card.id !== id));
        const newTagInputs = { ...tagInputs };
        delete newTagInputs[id];
        setTagInputs(newTagInputs);
      }, 300);
    }
  };

  const toggleCollapse = (id: string) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, isCollapsed: !card.isCollapsed } : card
      )
    );
  };

  const updateCardBody = (id: string, body: string) => {
    setCards(cards.map((card) => (card.id === id ? { ...card, body } : card)));
  };

  const addTag = (id: string) => {
    const tagInput = tagInputs[id]?.trim();
    if (tagInput) {
      setCards(
        cards.map((card) =>
          card.id === id ? { ...card, tags: [...card.tags, tagInput] } : card
        )
      );
      setTagInputs({ ...tagInputs, [id]: "" });
    }
  };

  const removeTag = (cardId: string, tagIndex: number) => {
    setCards(
      cards.map((card) =>
        card.id === cardId
          ? { ...card, tags: card.tags.filter((_, i) => i !== tagIndex) }
          : card
      )
    );
  };

  const handleTagInputChange = (id: string, value: string) => {
    setTagInputs({ ...tagInputs, [id]: value });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(id);
    }
  };

  const handleSave = () => {
    console.log("保存するデータ:", cards);
    setSavedAnimation(true);
    setTimeout(() => setSavedAnimation(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 animate-slide-in-down">
          <h1 className="text-xl font-semibold text-foreground mb-1">
            今日の日記
          </h1>
          <p className="text-sm text-muted-foreground">
            今日あったことを記録しましょう
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={cn(
                "shadow-sm border-border",
                card.isRemoving
                  ? "animate-slide-out-up"
                  : "animate-slide-in-up transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleCollapse(card.id)}
                    className="flex items-center gap-3 flex-1 text-left group"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform"></div>
                      <CardTitle className="text-sm font-normal text-muted-foreground group-hover:text-foreground transition-colors">
                        {card.body
                          ? card.body.slice(0, 40) +
                            (card.body.length > 40 ? "..." : "")
                          : "今日の出来事を書き留めよう ✨"}
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
                  "overflow-hidden",
                  card.isCollapsed
                    ? "animate-collapse-height"
                    : "animate-expand-height"
                )}
              >
                <CardContent className="space-y-4 pt-0">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      本文
                    </label>
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

        <div className="flex gap-3 sticky bottom-6">
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
            className={cn(
              "flex-1 h-11 text-sm font-medium bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-95",
              savedAnimation && "animate-save-success"
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            {savedAnimation ? "保存しました!" : "保存"}
          </Button>
        </div>
      </div>

      {savedAnimation && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-scale-in">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">保存完了!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
