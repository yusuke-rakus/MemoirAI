import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LegalDocumentLayout } from "../components/LegalDocumentLayout";
import { LEGAL_DOCUMENTS } from "../documents";

export const LegalPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hash]);

  return <LegalDocumentLayout documents={LEGAL_DOCUMENTS} />;
};
