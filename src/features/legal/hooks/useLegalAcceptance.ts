import { useCallback, useEffect, useRef, useState } from "react";

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
  const [state, setState] = useState<{
    uid?: string;
    status: LegalAcceptanceStatus;
  }>({ status: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [requestId, setRequestId] = useState(0);
  const currentUid = useRef(uid);
  currentUid.current = uid;
  const submissionRevision = useRef(0);

  useEffect(() => {
    submissionRevision.current++;
    setIsSubmitting(false);
    if (!uid) {
      setState({ uid, status: "idle" });
      setSubmitError(false);
      return;
    }

    let isCurrent = true;
    setState({ uid, status: "loading" });
    setSubmitError(false);

    void LegalAcceptanceClient.getCurrent(uid, legalAcceptancePolicy)
      .then((acceptance) => {
        if (isCurrent)
          setState({ uid, status: acceptance ? "accepted" : "required" });
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch legal acceptance", error);
        if (isCurrent) setState({ uid, status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [requestId, uid]);

  const accept = useCallback(async () => {
    if (!uid || isSubmitting) return;

    const revision = ++submissionRevision.current;
    const isCurrent = () =>
      currentUid.current === uid && submissionRevision.current === revision;
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      await LegalAcceptanceClient.acceptCurrent(uid, legalAcceptancePolicy);
      if (isCurrent()) setState({ uid, status: "accepted" });
    } catch (error) {
      console.error("Failed to save legal acceptance", error);
      if (isCurrent()) setSubmitError(true);
    } finally {
      if (isCurrent()) setIsSubmitting(false);
    }
  }, [isSubmitting, uid]);

  const retry = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  const status: LegalAcceptanceStatus =
    uid && state.uid === uid ? state.status : "idle";
  return { status, isSubmitting, submitError, accept, retry };
};
