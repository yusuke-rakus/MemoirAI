import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  LEGAL_DOCUMENT_IDS,
  type LegalDocument,
  type LegalDocumentId,
} from "../types/legalDocument";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    );
  }, "日付が正しくありません。");

const legalDocumentMetadataSchema = z
  .object({
    id: z.enum(LEGAL_DOCUMENT_IDS),
    title: z.string().min(1),
    version: z.string().regex(/^\d{4}-\d{2}-\d{2}\.[0-9a-f]{8}$/),
    effectiveDate: isoDateSchema,
    introduction: z.string().min(1),
  })
  .strict();

export type LegalDocumentParts = {
  metadataSource: string;
  body: string;
};

export const splitLegalDocument = (source: string): LegalDocumentParts => {
  const normalizedSource = source.replace(/\r\n?/g, "\n");
  const match = normalizedSource.match(
    /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/,
  );

  if (!match) {
    throw new Error("Legal document front matter is missing or malformed.");
  }

  const body = match[2].trim();
  if (!body) {
    throw new Error("Legal document body is empty.");
  }

  return {
    metadataSource: match[1],
    body,
  };
};

export const parseLegalDocument = (
  source: string,
  expectedId?: LegalDocumentId,
): LegalDocument => {
  const { metadataSource, body } = splitLegalDocument(source);
  const metadata = legalDocumentMetadataSchema.parse(parseYaml(metadataSource));

  if (expectedId && metadata.id !== expectedId) {
    throw new Error(
      `Legal document id mismatch: expected ${expectedId}, received ${metadata.id}.`,
    );
  }

  return { ...metadata, body };
};

export const getLegalDocumentDisplayVersion = (version: string) =>
  version.slice(0, 10);

export const formatLegalEffectiveDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
};
