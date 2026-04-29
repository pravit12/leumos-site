import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";

type AnchorProps = ComponentProps<"a">;

function isInternalHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

function MdxLink(props: AnchorProps) {
  const { href, children, ...rest } = props;
  if (typeof href === "string" && isInternalHref(href)) {
    return (
      <Link
        href={href}
        className="font-medium text-lumos-700 underline decoration-lumos-300 underline-offset-2 transition-colors hover:text-lumos-800 hover:decoration-lumos-500"
        {...rest}
      >
        {children}
      </Link>
    );
  }
  const isExternal = typeof href === "string" && /^https?:/i.test(href);
  return (
    <a
      href={href}
      className="font-medium text-lumos-700 underline decoration-lumos-300 underline-offset-2 transition-colors hover:text-lumos-800 hover:decoration-lumos-500"
      {...(isExternal ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

type MdxImageProps = Partial<ImageProps> & {
  src?: string;
  alt?: string;
};

function MdxImage(props: MdxImageProps) {
  const { src, alt, width, height, ...rest } = props;
  if (!src || typeof src !== "string") return null;
  if (!alt) {
    throw new Error(
      `MDX image is missing required alt text: ${src}. Set alt="" for purely decorative images.`,
    );
  }
  return (
    <span className="my-8 block">
      <Image
        src={src}
        alt={alt}
        width={typeof width === "number" ? width : 1200}
        height={typeof height === "number" ? height : 675}
        className="h-auto w-full rounded-lg border border-ink-100 bg-ink-50"
        sizes="(min-width: 768px) 720px, 100vw"
        {...rest}
      />
      {alt && (
        <span className="mt-2 block text-sm text-ink-400">{alt}</span>
      )}
    </span>
  );
}

export const blogMdxComponents: MDXComponents = {
  a: MdxLink,
  img: MdxImage as MDXComponents["img"],
  h2: (props) => (
    <h2
      className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 scroll-mt-24 text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-5 text-base leading-7 text-ink-600 sm:text-lg sm:leading-8" {...props} />
  ),
  ul: (props) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 text-base leading-7 text-ink-600 sm:text-lg" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 text-base leading-7 text-ink-600 sm:text-lg" {...props} />
  ),
  li: (props) => <li className="marker:text-ink-300" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-4 border-lumos-400 bg-lumos-50/60 px-5 py-4 text-base italic text-ink-700 sm:text-lg"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded-sm bg-ink-100 px-1.5 py-0.5 font-mono text-[0.9em] text-ink-800"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-lg border border-ink-200 bg-ink-900 p-4 font-mono text-sm leading-6 text-ink-50"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-ink-100" />,
  table: (props) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-ink-50 text-ink-700" {...props} />,
  th: (props) => (
    <th className="border border-ink-100 px-3 py-2 font-semibold" {...props} />
  ),
  td: (props) => <td className="border border-ink-100 px-3 py-2 align-top text-ink-600" {...props} />,
  strong: (props) => <strong className="font-semibold text-ink-900" {...props} />,
};
