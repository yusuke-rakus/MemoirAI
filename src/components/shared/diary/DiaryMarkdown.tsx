import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type DiaryMarkdownProps = {
  children: string;
  className?: string;
  variant?: "detail" | "excerpt";
};

const detailComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-7 text-2xl font-bold tracking-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-7 text-xl font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-5 text-base font-semibold text-foreground first:mt-0">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-5 text-sm font-semibold text-foreground first:mt-0">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-5 text-sm font-medium text-muted-foreground first:mt-0">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="mt-3 leading-7 whitespace-pre-wrap first:mt-0">{children}</p>
  ),
  ul: ({ children, className }) => (
    <ul
      className={cn(
        "mt-3 list-disc space-y-1.5 pl-6 leading-7 first:mt-0",
        className?.includes("contains-task-list") && "list-none pl-0",
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1.5 pl-6 leading-7 first:mt-0">
      {children}
    </ol>
  ),
  li: ({ children, className }) => (
    <li
      className={cn(
        "pl-1 marker:text-muted-foreground",
        className?.includes("task-list-item") && "list-none pl-0",
      )}
    >
      {children}
    </li>
  ),
  input: ({ type, checked, disabled }) =>
    type === "checkbox" ? (
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        readOnly
        className="mr-2 size-4 translate-y-0.5 accent-primary"
      />
    ) : null,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-2 border-primary/50 pl-4 text-muted-foreground italic first:mt-0">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => {
    const isExternal =
      href?.startsWith("http://") || href?.startsWith("https://");

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="rounded-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  del: ({ children }) => (
    <del className="text-muted-foreground decoration-muted-foreground/70">
      {children}
    </del>
  ),
  hr: () => <hr className="my-6 border-border" />,
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-md border bg-muted/60 p-4 text-sm leading-6 first:mt-0 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-md border first:mt-0">
      <table className="w-full min-w-max border-collapse text-left text-sm [&_tbody_tr:last-child_td]:border-b-0">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b bg-muted/60 px-3 py-2 font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b px-3 py-2 align-top">{children}</td>
  ),
  img: () => null,
};

const ExcerptBlock = ({ children }: { children?: ReactNode }) => (
  <span>{children} </span>
);

const ExcerptInline = ({ children }: { children?: ReactNode }) => (
  <span>{children}</span>
);

const excerptComponents: Components = {
  h1: ExcerptBlock,
  h2: ExcerptBlock,
  h3: ExcerptBlock,
  h4: ExcerptBlock,
  h5: ExcerptBlock,
  h6: ExcerptBlock,
  p: ExcerptBlock,
  ul: ExcerptInline,
  ol: ExcerptInline,
  li: ExcerptBlock,
  blockquote: ExcerptBlock,
  pre: ExcerptBlock,
  code: ExcerptInline,
  table: ExcerptInline,
  thead: ExcerptInline,
  tbody: ExcerptInline,
  tr: ExcerptInline,
  th: ExcerptBlock,
  td: ExcerptBlock,
  a: ExcerptInline,
  strong: ExcerptInline,
  em: ExcerptInline,
  del: ExcerptInline,
  br: () => <span> </span>,
  hr: () => <span> </span>,
  input: () => null,
  img: () => null,
};

export const DiaryMarkdown = ({
  children,
  className,
  variant = "detail",
}: DiaryMarkdownProps) => {
  if (variant === "excerpt") {
    return (
      <span className={className}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={excerptComponents}
          skipHtml
        >
          {children}
        </ReactMarkdown>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "max-w-[70ch] text-foreground/80 [&_blockquote>p]:mt-0 [&_li>p]:mt-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={detailComponents}
        skipHtml
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
