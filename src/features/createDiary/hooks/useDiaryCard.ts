import { useState } from "react";
import type { KeyboardEvent } from "react";

interface DiaryCard {
  id: string;
  body: string;
  tags: string[];
  date: Date;
  isCollapsed: boolean;
  isRemoving: boolean;
}

export const useDiaryCard = () => {
  const [cards, setCards] = useState<DiaryCard[]>([
    {
      id: "1",
      body: "",
      tags: [],
      date: new Date(),
      isCollapsed: false,
      isRemoving: false,
    },
  ]);
  const [tagInputs, setTagInputs] = useState<{ [key: string]: string }>({
    "1": "",
  });
  const [savedAnimation, setSavedAnimation] = useState(false);

  const addCard = () => {
    const newId = Date.now().toString();
    setCards([
      ...cards,
      {
        id: newId,
        body: "",
        tags: [],
        date: new Date(),
        isCollapsed: false,
        isRemoving: false,
      },
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

  const handleTagInputKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if ((e as KeyboardEvent).key === "Enter") {
      e.preventDefault();
      addTag(id);
    }
  };

  const handleSaveAction = () => {
    setSavedAnimation(true);
    setTimeout(() => setSavedAnimation(false), 2000);
  };

  return {
    // State
    cards,
    tagInputs,
    savedAnimation,

    // Actions
    addCard,
    removeCard,
    toggleCollapse,
    updateCardBody,
    addTag,
    removeTag,

    // Handlers
    handleTagInputChange,
    handleTagInputKeyDown,
    handleSaveAction,
  };
};
