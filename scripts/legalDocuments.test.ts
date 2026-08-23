// @vitest-environment node

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  checkLegalDocuments,
  getLegalDocumentBodyHash,
  syncLegalDocumentVersions,
} from "./legalDocuments";

const documents = [
  ["terms", "terms.md"],
  ["privacy", "privacy.md"],
  ["ai-data-use", "ai-data-use.md"],
] as const;

let directory: string;

const createSource = (id: string, body: string, overrides = "") => {
  const version = `2026-08-22.${getLegalDocumentBodyHash(body)}`;
  return `---
id: ${id}
title: ${id}
version: "${version}"
effectiveDate: "2026-08-22"
introduction: introduction
${overrides}---
${body}
`;
};

const writeDocumentSet = async () => {
  await Promise.all(
    documents.map(([id, fileName]) => {
      const body = `### ${id}\n\nbody`;
      return writeFile(path.join(directory, fileName), createSource(id, body));
    }),
  );
};

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "memoirai-legal-"));
  await writeDocumentSet();
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe("legal document management", () => {
  it("有効な3文書を検証する", async () => {
    await expect(checkLegalDocuments(directory)).resolves.toBeUndefined();
  });

  it("本文変更後のversion更新漏れを検知する", async () => {
    const termsPath = path.join(directory, "terms.md");
    const source = await readFile(termsPath, "utf8");
    await writeFile(termsPath, `${source}\nchanged`);

    await expect(checkLegalDocuments(directory)).rejects.toThrow(
      "version hash is stale",
    );
  });

  it("重複idを拒否する", async () => {
    const body = "### duplicate\n\nbody";
    await writeFile(
      path.join(directory, "privacy.md"),
      createSource("terms", body),
    );

    await expect(checkLegalDocuments(directory)).rejects.toThrow(
      "ids must be unique",
    );
  });

  it("不正な日付を拒否する", async () => {
    const filePath = path.join(directory, "terms.md");
    const source = await readFile(filePath, "utf8");
    await writeFile(
      filePath,
      source.replace(
        'effectiveDate: "2026-08-22"',
        'effectiveDate: "2026-02-30"',
      ),
    );

    await expect(checkLegalDocuments(directory)).rejects.toThrow();
  });

  it("front matterがない文書を拒否する", async () => {
    await writeFile(path.join(directory, "terms.md"), "### terms\n\nbody\n");

    await expect(checkLegalDocuments(directory)).rejects.toThrow(
      "front matter is missing or malformed",
    );
  });

  it("不正なversion形式を拒否する", async () => {
    const filePath = path.join(directory, "terms.md");
    const source = await readFile(filePath, "utf8");
    await writeFile(
      filePath,
      source.replace(/version: "[^"]+"/, 'version: "2026-08-22"'),
    );

    await expect(checkLegalDocuments(directory)).rejects.toThrow();
  });

  it("同期処理で本文に対応するversionへ更新する", async () => {
    const filePath = path.join(directory, "terms.md");
    const source = await readFile(filePath, "utf8");
    await writeFile(filePath, `${source}\nchanged`);

    await syncLegalDocumentVersions(directory);

    await expect(checkLegalDocuments(directory)).resolves.toBeUndefined();
  });
});
