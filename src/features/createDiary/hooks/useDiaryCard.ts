import type { KeyboardEvent } from "react";
import { create } from "zustand";

interface DiaryCard {
  id: string;
  title: string;
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
  updateCardTitle: (id: string, title: string) => void;
  updateCardBody: (id: string, body: string) => void;
  addTag: (id: string) => void;
  removeTag: (cardId: string, tagIndex: number) => void;
  handleTagInputChange: (id: string, value: string) => void;
  handleTagInputKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    id: string,
  ) => void;
  reset: (date?: Date) => void;
}

type DiaryCardStore = DiaryCardState & DiaryCardActions;

const INITIAL_CARD_ID = "1";

const getDateFromPath = (): Date => {
  if (typeof window === "undefined") return new Date();

  const path = window.location.pathname;
  const match = path.match(/\/(\d{4}-\d{2}-\d{2})$/);

  if (match) {
    const [_, dateStr] = match;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date();
};

const createCard = (id: string, date?: Date): DiaryCard => ({
  id,
  title: "",
  body: "",
  tags: [],
  date: date ?? getDateFromPath(),
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
          card.id === id ? { ...card, isRemoving: true } : card,
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
        card.id === id ? { ...card, isCollapsed: !card.isCollapsed } : card,
      ),
      tagInputs: state.tagInputs,
    })),
  updateCardTitle: (id, title) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, title } : card,
      ),
      tagInputs: state.tagInputs,
    })),
  updateCardBody: (id, body) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, body } : card,
      ),
      tagInputs: state.tagInputs,
    })),
  addTag: (id) =>
    set((state) => {
      const tagInput = state.tagInputs[id]?.trim();
      if (!tagInput) return state;
      return {
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, tags: [...card.tags, tagInput] } : card,
        ),
        tagInputs: { ...state.tagInputs, [id]: "" },
      };
    }),
  removeTag: (cardId, tagIndex) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, tags: card.tags.filter((_, i) => i !== tagIndex) }
          : card,
      ),
      tagInputs: state.tagInputs,
    })),
  handleTagInputChange: (id, value) =>
    set((state) => ({
      cards: state.cards,
      tagInputs: { ...state.tagInputs, [id]: value },
    })),
  handleTagInputKeyDown: (e, id) => {
    if (e.key !== "Enter") return;
    if (e.nativeEvent.isComposing) return;
    e.preventDefault();
    get().addTag(id);
    set((state) => ({
      cards: state.cards,
      tagInputs: { ...state.tagInputs, [id]: "" },
    }));
  },
  reset: (date) =>
    set(() => ({
      cards: [createCard(INITIAL_CARD_ID, date)],
      tagInputs: { [INITIAL_CARD_ID]: "" },
    })),
}));

export const useDiaryCard = () => useDiaryCardStore();
