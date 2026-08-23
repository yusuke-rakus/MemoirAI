import { Button } from "@/components/ui/button";
import type { LegalDocument } from "../types/legalDocument";
import {
  formatLegalEffectiveDate,
  getLegalDocumentDisplayVersion,
} from "../lib/legalDocument";
import { useLegalReturnDestination } from "../hooks/useLegalReturnDestination";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ArrowLeft, ArrowUp } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

type LegalDocumentLayoutProps = {
  documents: readonly LegalDocument[];
};

const markdownComponents: Components = {
  h3: ({ children }) => (
    <h3 className="mt-10 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-8 text-lg font-semibold tracking-tight">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mt-4 leading-7 text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 leading-7 text-muted-foreground">
      {children}
    </ol>
  ),
  a: ({ children, href }) => {
    const isExternal =
      href?.startsWith("http://") || href?.startsWith("https://");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="rounded-sm font-medium text-primary underline underline-offset-4 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-2 pl-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b px-3 py-2 text-muted-foreground">{children}</td>
  ),
};

export const LegalDocumentLayout = ({
  documents,
}: LegalDocumentLayoutProps) => {
  useDocumentTitle("利用規約");
  const returnDestination = useLegalReturnDestination();

  return (
    <div id="top" className="min-h-dvh w-full bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          {returnDestination ? (
            <Link
              to={returnDestination.to}
              className="rounded-sm text-lg font-bold tracking-tight focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              MemoirAI
            </Link>
          ) : (
            <span className="text-lg font-bold tracking-tight">MemoirAI</span>
          )}
          {returnDestination && (
            <Button asChild variant="ghost" size="sm">
              <Link to={returnDestination.to}>
                <ArrowLeft aria-hidden="true" />
                {returnDestination.label}
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <header>
          <p className="text-sm font-medium text-primary">MemoirAI Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            利用規約
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            MemoirAIの利用条件を定める利用規約です。プライバシーポリシーとAIデータ利用方針も、このページでご確認いただけます。
          </p>
        </header>

        <nav aria-label="リーガル文書の目次" className="mt-10 border-y py-5">
          <ol className="grid gap-1 sm:grid-cols-3 sm:gap-4">
            {documents.map((document, index) => (
              <li key={document.id}>
                <a
                  href={`#${document.id}`}
                  className="group flex items-baseline gap-2 rounded-sm py-2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="text-xs text-muted-foreground tabular-nums">
                    0{index + 1}
                  </span>
                  <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                    {document.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article>
          {documents.map((document) => (
            <section
              key={document.id}
              id={document.id}
              className="scroll-mt-20 border-b py-14 last:border-b-0 sm:py-16"
              aria-labelledby={`${document.id}-title`}
            >
              <header className="pb-2">
                <h2
                  id={`${document.id}-title`}
                  className="text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  {document.title}
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                  {document.introduction}
                </p>
                <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <dt>制定・施行日</dt>
                    <dd>{formatLegalEffectiveDate(document.effectiveDate)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt>文書バージョン</dt>
                    <dd>{getLegalDocumentDisplayVersion(document.version)}</dd>
                  </div>
                </dl>
              </header>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
                skipHtml
              >
                {document.body}
              </ReactMarkdown>
            </section>
          ))}
        </article>

        <footer className="flex justify-end pt-4 pb-8">
          <Button asChild variant="ghost" size="sm">
            <a href="#top">
              <ArrowUp aria-hidden="true" />
              ページ先頭へ
            </a>
          </Button>
        </footer>
      </main>
    </div>
  );
};
