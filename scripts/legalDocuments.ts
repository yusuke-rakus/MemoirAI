import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseLegalDocument } from "../src/features/legal/lib/legalDocument";
import type { LegalDocumentId } from "../src/features/legal/types/legalDocument";

const DOCUMENT_FILES = [
  { id: "terms", fileName: "terms.md" },
  { id: "privacy", fileName: "privacy.md" },
  { id: "ai-data-use", fileName: "ai-data-use.md" },
] as const satisfies ReadonlyArray<{
  id: LegalDocumentId;
  fileName: string;
}>;

const defaultDocumentDirectory = path.resolve(
  process.cwd(),
  "src/features/legal/documents",
);

export const getLegalDocumentBodyHash = (body: string) =>
  createHash("sha256").update(body).digest("hex").slice(0, 8);

const readLegalDocuments = async (documentDirectory: string) =>
  Promise.all(
    DOCUMENT_FILES.map(async ({ id, fileName }) => {
      const filePath = path.join(documentDirectory, fileName);
      const source = await readFile(filePath, "utf8");
      const document = parseLegalDocument(source);
      return { document, expectedId: id, filePath, source };
    }),
  );

export const checkLegalDocuments = async (
  documentDirectory = defaultDocumentDirectory,
) => {
  const documents = await readLegalDocuments(documentDirectory);
  const ids = new Set(documents.map(({ document }) => document.id));

  if (ids.size !== DOCUMENT_FILES.length) {
    throw new Error("Legal document ids must be unique.");
  }

  documents.forEach(({ document, expectedId, filePath }) => {
    if (document.id !== expectedId) {
      throw new Error(
        `${path.basename(filePath)} id must be ${expectedId}, received ${document.id}.`,
      );
    }
    const expectedHash = getLegalDocumentBodyHash(document.body);
    const actualHash = document.version.slice(-8);
    if (actualHash !== expectedHash) {
      throw new Error(
        `${path.basename(filePath)} version hash is stale: expected ${expectedHash}. Run pnpm legal:sync.`,
      );
    }
  });
};

const replaceVersion = (source: string, version: string) => {
  const normalizedSource = source.replace(/\r\n?/g, "\n");
  const closingDelimiterIndex = normalizedSource.indexOf("\n---", 4);
  if (closingDelimiterIndex < 0) {
    throw new Error("Legal document front matter is missing or malformed.");
  }

  const metadataBlock = normalizedSource.slice(0, closingDelimiterIndex);
  const versionLines = metadataBlock.match(/^version:\s*.+$/gm);
  if (versionLines?.length !== 1) {
    throw new Error("Legal document front matter must contain one version.");
  }

  return normalizedSource.replace(/^version:\s*.+$/m, `version: "${version}"`);
};

export const syncLegalDocumentVersions = async (
  documentDirectory = defaultDocumentDirectory,
) => {
  const documents = await readLegalDocuments(documentDirectory);

  await Promise.all(
    documents.map(async ({ document, filePath, source }) => {
      const versionDate = document.version.slice(0, 10);
      const bodyHash = getLegalDocumentBodyHash(document.body);
      const nextSource = replaceVersion(source, `${versionDate}.${bodyHash}`);
      if (nextSource !== source) {
        await writeFile(filePath, nextSource, "utf8");
      }
    }),
  );

  await checkLegalDocuments(documentDirectory);
};

const main = async () => {
  const command = process.argv[2];
  if (command === "check") {
    await checkLegalDocuments();
    console.info("Legal documents are valid and version hashes are current.");
    return;
  }
  if (command === "sync") {
    await syncLegalDocumentVersions();
    console.info("Legal document version hashes were synchronized.");
    return;
  }
  throw new Error("Use check or sync.");
};

const entryPoint = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";

if (import.meta.url === entryPoint) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Legal document validation failed: ${message}`);
    process.exitCode = 1;
  });
}
