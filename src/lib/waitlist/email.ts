import { Resend } from "resend";
import { siteConfig, getSiteUrl } from "@/lib/site";
import type { SignupRecord } from "./storage";
import { FOUNDING_TOTAL } from "./schema";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Leumos AI <hello@leumos.ai>";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

export type ConfirmationSendResult = {
  attempted: boolean;
  delivered: boolean;
  reason?: string;
  id?: string;
};

export type ConfirmationSendOptions = {
  /** Required when the rank-frame email template is in use. */
  rankToken: string;
};

export async function sendConfirmationEmail(
  record: SignupRecord,
  options: ConfirmationSendOptions,
): Promise<ConfirmationSendResult> {
  const resend = getResend();
  if (!resend) {
    return {
      attempted: false,
      delivered: false,
      reason: "RESEND_API_KEY not set; skipping email (dev/preview).",
    };
  }
  const siteUrl = getSiteUrl();
  const shareUrl = `${siteUrl}/?ref=${record.referralCode}`;
  const greeting = record.name ? `Hi ${record.name.split(/\s+/)[0]},` : "Hi,";
  const ogPng = `${siteUrl}/api/og/rank?token=${encodeURIComponent(options.rankToken)}&size=og`;

  const text = [
    greeting,
    "",
    `Thanks for joining the ${siteConfig.name} waitlist.`,
    "",
    `You're #${record.queuePosition} of ${FOUNDING_TOTAL.toLocaleString()} on the founding list. Founding pricing locks when the ${FOUNDING_TOTAL.toLocaleString()}th sign-up confirms.`,
    "",
    `Want to move up? Every editor who confirms from your link bumps your rank.`,
    `Your link: ${shareUrl}`,
    "",
    `(View this email in a browser to see your founding-rank card.)`,
    "",
    `— The ${siteConfig.name} team`,
  ].join("\n");

  // Inline HTML — kept under ~5 KB so most clients render the table layout
  // unchanged. The hero asset is the OG PNG generated at /api/og/rank, the
  // same image the user sees on the success page and shares to X.
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>You're #${record.queuePosition} on the ${siteConfig.shortName} founding list</title>
  </head>
  <body style="margin:0; padding:0; background:#0D1119; color:#F5F6F8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:32px 24px; line-height:1.55;">
      <p style="margin:0 0 16px; font-size:16px; color:#C9CFD9;">${greeting}</p>
      <p style="margin:0 0 24px; font-size:16px; color:#F5F6F8;">
        Thanks for joining the <strong>${siteConfig.name}</strong> waitlist.
        You&apos;re <strong>#${record.queuePosition}</strong> of ${FOUNDING_TOTAL.toLocaleString()} on the founding list.
      </p>

      <a href="${shareUrl}" style="display:block; text-decoration:none; margin:0 0 24px;">
        <img
          src="${ogPng}"
          alt="Cinematic frame: rank ${record.queuePosition} of ${FOUNDING_TOTAL.toLocaleString()} founding waitlist members."
          width="592"
          height="311"
          style="display:block; width:100%; max-width:592px; height:auto; border-radius:14px; border:0; outline:0;"
        />
      </a>

      <p style="margin:0 0 12px; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#FFA866;">
        Move up the queue
      </p>
      <p style="margin:0 0 16px; font-size:16px; color:#F5F6F8;">
        Every editor who confirms from your link bumps your rank. No quotas, no tiers.
      </p>

      <table role="presentation" style="border-collapse:collapse; width:100%; margin:0 0 24px; background:#161B26; border:1px solid rgba(255,255,255,0.08); border-radius:10px;">
        <tr>
          <td style="padding:16px 18px;">
            <p style="margin:0 0 4px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#97A0AF;">Your referral link</p>
            <p style="margin:0; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; font-size:14px; color:#F5F6F8; word-break:break-all;">
              <a href="${shareUrl}" style="color:#5FCDE0; text-decoration:none;">${shareUrl}</a>
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:24px 0 0; font-size:14px; color:#97A0AF;">
        — The ${siteConfig.name} team
      </p>
    </div>
  </body>
</html>`.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [record.email],
      subject: `You're #${record.queuePosition} of ${FOUNDING_TOTAL.toLocaleString()} on the ${siteConfig.shortName} founding list`,
      text,
      html,
      tags: [
        { name: "type", value: "waitlist_confirmation" },
        { name: "ref", value: record.referredBy ?? "none" },
      ],
    });
    if (error) {
      return { attempted: true, delivered: false, reason: error.message };
    }
    return { attempted: true, delivered: true, id: data?.id };
  } catch (err) {
    return {
      attempted: true,
      delivered: false,
      reason: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function syncToAudience(record: SignupRecord): Promise<void> {
  const resend = getResend();
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!resend || !audienceId) return;
  try {
    await resend.contacts.create({
      audienceId,
      email: record.email,
      firstName: record.name?.split(/\s+/)[0],
      lastName: record.name?.split(/\s+/).slice(1).join(" ") || undefined,
      unsubscribed: false,
    });
  } catch {
    // Audience sync is best-effort; the confirmation send is the source of truth.
  }
}
