import { parseLegalDocument } from "../lib/legalDocument";
import aiDataUseSource from "./ai-data-use.md?raw";
import privacySource from "./privacy.md?raw";
import termsSource from "./terms.md?raw";

export const LEGAL_DOCUMENTS = [
  parseLegalDocument(termsSource, "terms"),
  parseLegalDocument(privacySource, "privacy"),
  parseLegalDocument(aiDataUseSource, "ai-data-use"),
] as const;
