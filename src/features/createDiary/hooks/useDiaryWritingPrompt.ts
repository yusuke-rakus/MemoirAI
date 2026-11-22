import { useEffect, useRef, useState } from "react";

import { diaryWritingPrompts } from "../diaryWritingPrompts";

const HISTORY_KEY = "memoir-ai:diary-writing-prompts:v1";
const promptIndexes = diaryWritingPrompts.map((_, index) => index);
let unsavedHistory: number[] | undefined;

const readHistory = (): number[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const stored: unknown = raw ? JSON.parse(raw) : [];
    if (
      Array.isArray(stored) &&
      stored.every(
        (index: unknown) =>
          typeof index === "number" &&
          Number.isInteger(index) &&
          index >= 0 &&
          index < diaryWritingPrompts.length,
      )
    ) {
      return Array.from(new Set<number>(stored));
    }
  } catch {
    // A blocked or malformed history can be rebuilt on the next draw.
  }
  return [];
};

export const drawDiaryWritingPrompt = (): string => {
  const history = unsavedHistory ?? readHistory();
  const cycleComplete = history.length === diaryWritingPrompts.length;
  // Leave the previous cycle's final prompt out of the first draw only.
  const excluded = new Set(cycleComplete ? history.slice(-1) : history);
  const remaining = promptIndexes.filter((index) => !excluded.has(index));
  const index = remaining[Math.floor(Math.random() * remaining.length)];
  const nextHistory = cycleComplete ? [index] : [...history, index];

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    unsavedHistory = undefined;
  } catch {
    unsavedHistory = nextHistory;
  }

  return diaryWritingPrompts[index];
};

export const useDiaryWritingPrompt = (editorReady = true) => {
  const [prompt, setPrompt] = useState<string>();
  const didDraw = useRef(false);

  useEffect(() => {
    if (!editorReady || didDraw.current) return;
    let active = true;
    const draw = () => {
      if (!active || didDraw.current) return;
      didDraw.current = true;
      setPrompt(drawDiaryWritingPrompt());
    };

    if (navigator.locks) {
      void navigator.locks.request(HISTORY_KEY, draw).catch(draw);
    } else {
      draw();
    }

    return () => {
      active = false;
    };
  }, [editorReady]);

  return prompt;
};
