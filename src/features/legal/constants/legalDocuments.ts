import { LEGAL_DOCUMENTS } from "../documents";

export const REQUIRED_LEGAL_CONSENT_VERSION = "v1";

export const LEGAL_DOCUMENT_VERSIONS = {
  terms: LEGAL_DOCUMENTS[0].version,
  privacy: LEGAL_DOCUMENTS[1].version,
  aiDataUse: LEGAL_DOCUMENTS[2].version,
} as const;
