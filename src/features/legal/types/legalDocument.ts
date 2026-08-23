export const LEGAL_DOCUMENT_IDS = ["terms", "privacy", "ai-data-use"] as const;

export type LegalDocumentId = (typeof LEGAL_DOCUMENT_IDS)[number];

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  version: string;
  effectiveDate: string;
  introduction: string;
  body: string;
};
