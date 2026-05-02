import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

type MDXComponents = NonNullable<MDXRemoteProps["components"]>;

function isInternalHref(href: string | undefined): boolean {
  if (!href) return false;
  return href.startsWith("/") && !href.startsWith("//");
}

export const changelogMdxComponents: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-12 font-display text-2xl font-semibold text-ink-900"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mt-8 font-display text-xl font-semibold text-ink-900"
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="mt-4 max-w-prose text-ink-700" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      {...props}
      className="mt-4 max-w-prose list-disc space-y-2 pl-6 text-ink-700 marker:text-ink-300"
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className="mt-4 max-w-prose list-decimal space-y-2 pl-6 text-ink-700 marker:text-ink-400"
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className="leading-7" />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-semibold text-ink-900" />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      {...props}
      className="rounded bg-ink-100 px-1 py-0.5 font-mono text-sm text-ink-900"
    />
  ),
  a: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) => {
    if (isInternalHref(href)) {
      return (
        <Link
          href={href as string}
          className="text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-700"
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        {...rest}
        href={href}
        rel="noopener noreferrer"
        target={href?.startsWith("http") ? "_blank" : undefined}
        className="text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-700"
      >
        {children}
      </a>
    );
  },
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr {...props} className="my-12 border-ink-100" />
  ),
};
