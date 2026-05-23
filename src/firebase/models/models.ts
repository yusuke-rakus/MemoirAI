import { getAI, GoogleAIBackend } from "firebase/ai";
import { app } from "../firebase";

const DEFAULT_MODEL = "gemini-3-flash-preview";

const ai = getAI(app, { backend: new GoogleAIBackend() });

export { ai, DEFAULT_MODEL };
