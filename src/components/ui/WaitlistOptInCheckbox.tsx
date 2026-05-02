import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export const PUBLIC_NAME_OPTIN_FIELD = "showFirstNamePublic" as const;

interface WaitlistOptInCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name"> {
  id?: string;
  /**
   * Disclosure microcopy for the checkbox label. Defaults to the
   * placeholder copy so the checkbox always renders something honest;
   * ContentGrowth lands the final copy via LEU-40.
   */
  label?: string;
  /** Optional secondary line shown beneath the label. */
  helpText?: string;
  /** Override the form-field name. Defaults to PUBLIC_NAME_OPTIN_FIELD. */
  name?: string;
}

/**
 * Optional opt-in checkbox shown on every waitlist form (LEU-44).
 *
 * Default OFF. Rendering this checkbox is the only way the
 * /api/waitlist/social-proof endpoint will ever surface a user's first name —
 * we never opt anyone in implicitly.
 */
export function WaitlistOptInCheckbox({
  id = "waitlist-public-name",
  label = "Show my first name on the public waitlist",
  helpText = "Optional. We'll only show your first name — no email, no role, no city. You can change your mind any time by replying to the confirmation email.",
  name = PUBLIC_NAME_OPTIN_FIELD,
  className,
  defaultChecked = false,
  ...rest
}: WaitlistOptInCheckboxProps) {
  const helpId = helpText ? `${id}-help` : undefined;

  return (
    <label
      htmlFor={id}
      className={cn("waitlist-optin", className)}
      data-waitlist-optin
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        aria-describedby={helpId}
        className="waitlist-optin__input"
        {...rest}
      />
      <span className="waitlist-optin__copy">
        <span className="waitlist-optin__label">{label}</span>
        {helpText ? (
          <span id={helpId} className="waitlist-optin__help">
            {helpText}
          </span>
        ) : null}
      </span>
    </label>
  );
}
