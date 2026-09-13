import { useCallback, useEffect, useState } from "react";

import {
  LEGAL_DOCUMENT_VERSIONS,
  REQUIRED_LEGAL_CONSENT_VERSION,
} from "@/features/legal/constants/legalDocuments";
import { LegalAcceptanceClient } from "@/lib/service/legalAcceptanceClient";

const legalAcceptancePolicy = {
  requiredConsentVersion: REQUIRED_LEGAL_CONSENT_VERSION,
  documentVersions: LEGAL_DOCUMENT_VERSIONS,
};

export type LegalAcceptanceStatus =
  "idle" | "loading" | "accepted" | "required" | "error";

export const useLegalAcceptance = (uid?: string) => {
  const [status, setStatus] = useState<LegalAcceptanceStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!uid) {
      setStatus("idle");
      setSubmitError(false);
      return;
    }

    let isCurrent = true;
    setStatus("loading");
    setSubmitError(false);

    void LegalAcceptanceClient.getCurrent(uid, legalAcceptancePolicy)
      .then((acceptance) => {
        if (isCurrent) setStatus(acceptance ? "accepted" : "required");
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch legal acceptance", error);
        if (isCurrent) setStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [requestId, uid]);

  const accept = useCallback(async () => {
    if (!uid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(false);
    try {
      await LegalAcceptanceClient.acceptCurrent(uid, legalAcceptancePolicy);
      setStatus("accepted");
    } catch (error) {
      console.error("Failed to save legal acceptance", error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, uid]);

  const retry = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  return { status, isSubmitting, submitError, accept, retry };
};
