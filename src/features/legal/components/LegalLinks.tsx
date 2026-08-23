import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type LegalLinksProps = {
  className?: string;
  linkClassName?: string;
  target?: "_blank";
};

const links = [{ to: PATHS.legal.path, label: "利用規約" }] as const;

export const LegalLinks = ({
  className,
  linkClassName,
  target,
}: LegalLinksProps) => (
  <nav aria-label="利用規約" className={cn("flex flex-wrap", className)}>
    {links.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={cn(
          "rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
          linkClassName,
        )}
      >
        {link.label}
      </Link>
    ))}
  </nav>
);
