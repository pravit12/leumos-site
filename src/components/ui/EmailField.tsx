import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

interface EmailFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  id?: string;
  label: string;
  helpText?: string;
  errorText?: string;
  /** "block" stacks label above input (default). "inline" hides label visually for hero pill form. */
  layout?: "block" | "inline";
  /** Pill radius for inline hero use; sm radius for block forms. */
  pill?: boolean;
}

export function EmailField({
  id = "email",
  label,
  helpText,
  errorText,
  layout = "block",
  pill = false,
  className,
  required,
  ...props
}: EmailFieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const radius = pill ? "rounded-pill" : "rounded-sm";

  const labelClasses = cn(
    "block font-medium text-stage-200",
    layout === "inline" ? "sr-only" : "mb-2 text-sm"
  );

  const inputClasses = cn(
    "w-full bg-stage-700 text-stage-50 placeholder:text-stage-400",
    "border border-[var(--border-strong)] px-4 py-3 text-base",
    "transition-colors duration-base ease-standard",
    "hover:border-signal-300/40",
    "focus:outline-none focus:border-signal-300",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-300",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    radius,
    errorText && "border-hot-500"
  );

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-signal-300">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        name={props.name ?? "email"}
        type="email"
        inputMode="email"
        autoComplete="email"
        required={required}
        aria-required={required || undefined}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses}
        {...props}
      />
      {helpText ? (
        <p id={helpId} className="mt-2 text-small">
          {helpText}
        </p>
      ) : null}
      {errorText ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-center gap-2 text-sm text-hot-300"
        >
          <ErrorIcon />
          <span>{errorText}</span>
        </p>
      ) : null}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 4.5v4M8 11h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
