import { DIARY_PROMPT_MESSAGES } from "@/constants/diaryMessages";
import { useMemo } from "react";

const RANDOM_MESSAGES_LENGTH = 5;

export const usePickMessages = () => {
  const pickRandomMessages = useMemo(() => {
    return DIARY_PROMPT_MESSAGES.slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, RANDOM_MESSAGES_LENGTH);
  }, []);

  return { pickRandomMessages };
};
