import {
  LEGAL_DOCUMENT_VERSIONS,
  REQUIRED_LEGAL_CONSENT_VERSION,
} from "@/features/legal/constants/legalDocuments";
import { db } from "@/firebase/firebase";
import type { LegalAcceptance } from "@/types/legal";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { z } from "zod";

const storedLegalAcceptanceSchema = z.object({
  uid: z.string().min(1),
  requiredConsentVersion: z.string().min(1),
  documentVersions: z.object({
    terms: z.string().min(1),
    privacy: z.string().min(1),
    aiDataUse: z.string().min(1),
  }),
  confirmedAdult: z.boolean(),
  acceptanceMethod: z.literal("single-checkbox"),
  locale: z.literal("ja-JP"),
  acceptedAt: z.custom<LegalAcceptance["acceptedAt"]>(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function",
  ),
});

const legalAcceptanceSchema = storedLegalAcceptanceSchema.extend({
  confirmedAdult: z.literal(true),
});

const currentAcceptanceRef = (uid: string) =>
  doc(db, "users", uid, "legalAcceptances", REQUIRED_LEGAL_CONSENT_VERSION);

export class LegalAcceptanceClient {
  static async getCurrent(uid: string): Promise<LegalAcceptance | null> {
    if (!uid) {
      throw new Error("uid is required to fetch legal acceptance.");
    }

    const snapshot = await getDoc(currentAcceptanceRef(uid));
    if (!snapshot.exists()) return null;

    const parsed = storedLegalAcceptanceSchema.safeParse(snapshot.data());
    if (!parsed.success) {
      throw new Error("Stored legal acceptance is invalid.");
    }

    if (
      parsed.data.uid !== uid ||
      parsed.data.requiredConsentVersion !== REQUIRED_LEGAL_CONSENT_VERSION
    ) {
      throw new Error("Stored legal acceptance does not match the user.");
    }

    if (!parsed.data.confirmedAdult) return null;

    return legalAcceptanceSchema.parse(parsed.data);
  }

  static async acceptCurrent(uid: string): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to save legal acceptance.");
    }

    await setDoc(currentAcceptanceRef(uid), {
      uid,
      requiredConsentVersion: REQUIRED_LEGAL_CONSENT_VERSION,
      documentVersions: LEGAL_DOCUMENT_VERSIONS,
      confirmedAdult: true,
      acceptanceMethod: "single-checkbox",
      locale: "ja-JP",
      acceptedAt: serverTimestamp(),
    });
  }
}
