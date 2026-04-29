import { Resend } from "resend";
import { siteConfig, getSiteUrl } from "@/lib/site";
import type { SignupRecord } from "./storage";

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

export async function sendConfirmationEmail(
  record: SignupRecord,
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

  const text = [
    greeting,
    "",
    `Thanks for joining the ${siteConfig.name} waitlist. You're in.`,
    "",
    `What's next: we're heads-down building, and we'll email you when your access opens. Expect at most one update from us a month — we hate inbox clutter as much as you do.`,
    "",
    `Your queue position: #${record.queuePosition}`,
    `Your referral code: ${record.referralCode}`,
    `Share this link to move up the line — every confirmed sign-up lifts you ~10 spots:`,
    shareUrl,
    "",
    "If you can spare 15 seconds, just forward this email to one person who'd find Leumos useful. That's the single biggest favor you can do us right now.",
    "",
    `— The ${siteConfig.name} team`,
  ].join("\n");

  const html = `
<!doctype html>
<html lang="en">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #161a25; max-width: 560px; margin: 0 auto; padding: 24px; line-height: 1.5;">
    <p>${greeting}</p>
    <p>Thanks for joining the <strong>${siteConfig.name}</strong> waitlist. You&apos;re in.</p>
    <p>What&apos;s next: we&apos;re heads-down building, and we&apos;ll email you when your access opens. Expect at most one update a month — we hate inbox clutter as much as you do.</p>
    <table role="presentation" style="border-collapse:collapse; width:100%; margin:24px 0; background:#fffaeb; border-radius:12px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 4px; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#b75007;">Your spot</p>
          <p style="margin:0; font-size:32px; font-weight:600;">#${record.queuePosition}</p>
          <p style="margin:14px 0 4px; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#b75007;">Your referral code</p>
          <p style="margin:0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:18px;">${record.referralCode}</p>
        </td>
      </tr>
    </table>
    <p>Share this link to move up the line — every confirmed sign-up lifts you ~10 spots:</p>
    <p><a href="${shareUrl}" style="color:#b75007;">${shareUrl}</a></p>
    <p>If you can spare 15 seconds, forward this email to one person who&apos;d find Leumos useful. That&apos;s the single biggest favor you can do us right now.</p>
    <p>— The ${siteConfig.name} team</p>
  </body>
</html>`.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [record.email],
      subject: `You're on the ${siteConfig.name} waitlist (#${record.queuePosition})`,
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
