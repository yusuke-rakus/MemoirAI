import { getAI, GoogleAIBackend } from "firebase/ai";
import { app } from "../firebase";

const DEFAULT_MODEL = "gemini-2.5-flash";

const ai = getAI(app, { backend: new GoogleAIBackend() });

export { ai, DEFAULT_MODEL };
