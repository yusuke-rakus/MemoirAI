import { PATHS } from "@/constants/path";
import { Navigate } from "react-router-dom";
import type { LegalDocumentId } from "../types/legalDocument";

export const LegacyLegalRedirect = ({
  documentId,
}: {
  documentId: LegalDocumentId;
}) => <Navigate to={`${PATHS.legal.path}#${documentId}`} replace />;
