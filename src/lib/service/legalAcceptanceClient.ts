import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { z } from "zod";

import { db } from "@/firebase/firebase";
import type { LegalAcceptance, LegalDocumentVersions } from "@/types/legal";

export type LegalAcceptancePolicy = {
  requiredConsentVersion: string;
  documentVersions: LegalDocumentVersions;
};

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

const currentAcceptanceRef = (uid: string, requiredConsentVersion: string) =>
  doc(db, "users", uid, "legalAcceptances", requiredConsentVersion);

export class LegalAcceptanceClient {
  static async getCurrent(
    uid: string,
    policy: LegalAcceptancePolicy,
  ): Promise<LegalAcceptance | null> {
    if (!uid) {
      throw new Error("uid is required to fetch legal acceptance.");
    }

    const snapshot = await getDoc(
      currentAcceptanceRef(uid, policy.requiredConsentVersion),
    );
    if (!snapshot.exists()) return null;

    const parsed = storedLegalAcceptanceSchema.safeParse(snapshot.data());
    if (!parsed.success) {
      throw new Error("Stored legal acceptance is invalid.");
    }

    if (
      parsed.data.uid !== uid ||
      parsed.data.requiredConsentVersion !== policy.requiredConsentVersion
    ) {
      throw new Error("Stored legal acceptance does not match the user.");
    }

    if (!parsed.data.confirmedAdult) return null;

    return legalAcceptanceSchema.parse(parsed.data);
  }

  static async acceptCurrent(
    uid: string,
    policy: LegalAcceptancePolicy,
  ): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to save legal acceptance.");
    }

    await setDoc(currentAcceptanceRef(uid, policy.requiredConsentVersion), {
      uid,
      requiredConsentVersion: policy.requiredConsentVersion,
      documentVersions: policy.documentVersions,
      confirmedAdult: true,
      acceptanceMethod: "single-checkbox",
      locale: "ja-JP",
      acceptedAt: serverTimestamp(),
    });
  }
}
