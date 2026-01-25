import { useEffect, useState } from "react";

export const useRotatingText = (text: string | string[], duration = 5000) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!Array.isArray(text)) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % text.length);
    }, duration);
    return () => clearInterval(interval);
  }, [text, duration]);

  const currentText = Array.isArray(text) ? text[index] : text;

  return currentText;
};
