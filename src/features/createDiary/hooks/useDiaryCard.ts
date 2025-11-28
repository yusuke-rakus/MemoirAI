import { create } from "zustand";
import type { KeyboardEvent } from "react";

interface DiaryCard {
  id: string;
  body: string;
  tags: string[];
  date: Date;
  isCollapsed: boolean;
  isRemoving: boolean;
}

interface DiaryCardState {
  cards: DiaryCard[];
  tagInputs: Record<string, string>;
}

interface DiaryCardActions {
  addCard: () => void;
  removeCard: (id: string) => void;
  toggleCollapse: (id: string) => void;
  updateCardBody: (id: string, body: string) => void;
  addTag: (id: string) => void;
  removeTag: (cardId: string, tagIndex: number) => void;
  handleTagInputChange: (id: string, value: string) => void;
  handleTagInputKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    id: string
  ) => void;
}

type DiaryCardStore = DiaryCardState & DiaryCardActions;

const INITIAL_CARD_ID = "1";

const createCard = (id: string): DiaryCard => ({
  id,
  body: "",
  tags: [],
  date: new Date(),
  isCollapsed: false,
  isRemoving: false,
});

const useDiaryCardStore = create<DiaryCardStore>((set, get) => ({
  cards: [createCard(INITIAL_CARD_ID)],
  tagInputs: { [INITIAL_CARD_ID]: "" },
  addCard: () => {
    const newId = Date.now().toString();
    const newCard = createCard(newId);
    set((state) => ({
      cards: [...state.cards, newCard],
      tagInputs: { ...state.tagInputs, [newId]: "" },
    }));
  },
  removeCard: (id) => {
    set((state) => {
      if (state.cards.length <= 1) return state;
      return {
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, isRemoving: true } : card
        ),
        tagInputs: state.tagInputs,
      };
    });

    setTimeout(() => {
      set((state) => {
        if (state.cards.length <= 1) return state;
        const cards = state.cards.filter((card) => card.id !== id);
        const nextTagInputs = { ...state.tagInputs };
        delete nextTagInputs[id];
        return { cards, tagInputs: nextTagInputs };
      });
    }, 300);
  },
  toggleCollapse: (id) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, isCollapsed: !card.isCollapsed } : card
      ),
      tagInputs: state.tagInputs,
    })),
  updateCardBody: (id, body) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, body } : card
      ),
      tagInputs: state.tagInputs,
    })),
  addTag: (id) =>
    set((state) => {
      const tagInput = state.tagInputs[id]?.trim();
      if (!tagInput) return state;
      return {
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, tags: [...card.tags, tagInput] } : card
        ),
        tagInputs: { ...state.tagInputs, [id]: "" },
      };
    }),
  removeTag: (cardId, tagIndex) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, tags: card.tags.filter((_, i) => i !== tagIndex) }
          : card
      ),
      tagInputs: state.tagInputs,
    })),
  handleTagInputChange: (id, value) =>
    set((state) => ({
      cards: state.cards,
      tagInputs: { ...state.tagInputs, [id]: value },
    })),
  handleTagInputKeyDown: (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault();
      get().addTag(id);
    }
  },
}));

export const useDiaryCard = () => useDiaryCardStore();
