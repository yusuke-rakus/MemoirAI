import type { Timestamp } from "firebase/firestore";

export type LegalDocumentVersions = {
  terms: string;
  privacy: string;
  aiDataUse: string;
};

export type LegalAcceptance = {
  uid: string;
  requiredConsentVersion: string;
  documentVersions: LegalDocumentVersions;
  confirmedAdult: true;
  acceptanceMethod: "single-checkbox";
  locale: "ja-JP";
  acceptedAt: Timestamp;
};
