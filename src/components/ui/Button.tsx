import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "ghost" | "outline";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingLabel?: string;
  pill?: boolean;
  trailingIcon?: ReactNode;
  leadingIcon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium " +
  "transition-[background-color,color,border-color,transform,box-shadow,opacity] " +
  "duration-base ease-standard select-none whitespace-nowrap " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "active:translate-y-px";

const variants: Record<Variant, string> = {
  primary:
    "bg-signal-500 text-stage-900 shadow-md " +
    "hover:bg-signal-600 hover:shadow-lg " +
    "active:bg-signal-600 " +
    "disabled:bg-signal-700 disabled:text-stage-200",
  ghost:
    "bg-transparent text-stage-50 " +
    "hover:bg-stage-700 " +
    "active:bg-stage-600 " +
    "disabled:text-stage-300",
  outline:
    "bg-transparent text-stage-50 border border-stage-200/30 " +
    "hover:border-signal-300 hover:text-signal-300 " +
    "active:border-signal-500 active:text-signal-500 " +
    "disabled:border-stage-200/15 disabled:text-stage-300",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Loading…",
  pill = false,
  className,
  children,
  disabled,
  leadingIcon,
  trailingIcon,
  type = "button",
  ...props
}: ButtonProps) {
  const radius = pill ? "rounded-pill" : "rounded-sm";
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], radius, className)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {leadingIcon}
          <span>{children}</span>
          {trailingIcon}
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
