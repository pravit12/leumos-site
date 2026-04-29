import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

interface PullQuoteProps {
  body: ReactNode;
  attribution: ReactNode;
  className?: string;
}

export function PullQuote({ body, attribution, className }: PullQuoteProps) {
  return (
    <figure className={cn("pull-quote", className)}>
      <blockquote>{body}</blockquote>
      <cite>{attribution}</cite>
    </figure>
  );
}
