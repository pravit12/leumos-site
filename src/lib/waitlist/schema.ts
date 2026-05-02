import { z } from "zod";

export const ROLE_OPTIONS = [
  "founder",
  "engineer",
  "product",
  "design",
  "operations",
  "investor",
  "other",
] as const;

export const USE_CASE_OPTIONS = [
  "personal",
  "team",
  "startup",
  "enterprise",
  "research",
  "other",
] as const;

const trim = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional();

export const signupInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(254)
    .email("Enter a valid email address."),
  name: trim(120),
  company: trim(160),
  role: z.enum(ROLE_OPTIONS).optional(),
  useCase: z.enum(USE_CASE_OPTIONS).optional(),
  referredBy: z
    .string()
    .trim()
    .toUpperCase()
    .max(40)
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional(),
  // honeypot — accepted at the schema level so we can fake-success in the
  // route handler instead of revealing the trap via a validation error.
  website: z.string().max(2000).optional(),
  utm: z
    .object({
      source: trim(80),
      medium: trim(80),
      campaign: trim(120),
      content: trim(120),
      term: trim(120),
      referrer: trim(500),
      landingPath: trim(500),
    })
    .partial()
    .optional(),
});

export type SignupInput = z.infer<typeof signupInputSchema>;

export type SignupSuccessResponse = {
  ok: true;
  queuePosition: number;
  referralCode: string;
  referralCount: number;
  shareUrl: string;
  alreadyOnList: boolean;
  /** Short-lived signed payload consumed by `/api/og/rank` and the email template. */
  rankToken: string;
  /** Snapshot of the founding cap at sign-up time; held in the response so the
      client can render `#{rank} of {total}` without a follow-up call. */
  rankTotal: number;
};

export const FOUNDING_TOTAL = 1000;

export type SignupErrorResponse = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type SignupResponse = SignupSuccessResponse | SignupErrorResponse;
