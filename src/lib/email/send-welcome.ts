/**
 * send-welcome.ts — Resend-backed welcome email for newsletter subscribers
 *
 * Usage (server-only):
 *   import { sendWelcomeEmail } from "@/lib/email/send-welcome";
 *   await sendWelcomeEmail(email);
 *
 * Fires only if RESEND_API_KEY is configured + MAIL_FROM_ADDRESS is set.
 * Silently no-ops otherwise (development / no-DNS state).
 *
 * DOES NOT throw on failure — newsletter signup must succeed even if email fails.
 * Logs to server console for debugging.
 */

import "server-only";

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
  statusCode?: number;
};

export async function sendWelcomeEmail(toEmail: string): Promise<{ ok: boolean; reason?: string; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.MAIL_FROM_ADDRESS; // e.g., "Zaffaron <hello@zaffaron.com>"

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping welcome email");
    return { ok: false, reason: "no-api-key" };
  }
  if (!fromAddress) {
    console.warn("[email] MAIL_FROM_ADDRESS not set — skipping welcome email");
    return { ok: false, reason: "no-from-address" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: toEmail,
        subject: "Welcome to Zaffaron 🧡 Authentic recipes from every kitchen",
        html: welcomeHtmlTemplate(toEmail),
        text: welcomeTextTemplate(toEmail),
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as ResendResponse;
      console.error(`[email] Resend API ${res.status}: ${body.message || "unknown"}`);
      return { ok: false, reason: `resend-${res.status}` };
    }

    const data = (await res.json()) as ResendResponse;
    return { ok: true, id: data.id };
  } catch (e) {
    console.error(`[email] Welcome send failed:`, e);
    return { ok: false, reason: "network-error" };
  }
}

function welcomeHtmlTemplate(email: string): string {
  const unsubscribeUrl = `https://zaffaron.com/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Zaffaron</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafaf9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:40px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.02em;">Welcome to Zaffaron 🧡</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.92);font-size:15px;">Authentic recipes from every kitchen</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;color:#1c1917;font-size:15px;line-height:1.6;">
            <p>Thanks for joining us. You're now on the list for seasonal recipes, cultural food stories, and the occasional cooking tip from every kitchen we visit.</p>
            <p>What to expect:</p>
            <ul style="padding-left:20px;margin:16px 0;">
              <li><strong>A weekly recipe roundup</strong> — 5 standout recipes across our cuisines (Persian, Turkish, Lebanese, Afghan, Moroccan, Indian, Greek, Azerbaijani, and more)</li>
              <li><strong>Seasonal features</strong> — Ramadan iftars, Nowruz spreads, Eid tables, and festival foods from around the world</li>
              <li><strong>Never spam</strong> — one email per week, unsubscribe any time</li>
            </ul>
            <p style="margin:24px 0;">Start exploring now:</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="https://zaffaron.com/recipes" style="display:inline-block;background:#d97706;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Browse Recipes</a>
            </p>
            <hr style="border:none;border-top:1px solid #e7e5e4;margin:32px 0;">
            <p style="color:#78716c;font-size:13px;">Cooking a new recipe? Tag us. We love seeing your tables.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f5f4;padding:24px 32px;text-align:center;color:#78716c;font-size:12px;">
            <p style="margin:0 0 8px;">Zaffaron · Authentic recipes from every kitchen</p>
            <p style="margin:0;"><a href="${unsubscribeUrl}" style="color:#78716c;text-decoration:underline;">Unsubscribe</a> · <a href="https://zaffaron.com/privacy" style="color:#78716c;text-decoration:underline;">Privacy</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function welcomeTextTemplate(email: string): string {
  return `Welcome to Zaffaron 🧡

Thanks for joining us. You're now on the list for seasonal recipes, cultural food stories, and the occasional cooking tip.

What to expect:

- A weekly recipe roundup — 5 standout recipes across our cuisines (Persian, Turkish, Lebanese, Afghan, Moroccan, Indian, Greek, Azerbaijani, and more)
- Seasonal features — Ramadan iftars, Nowruz spreads, Eid tables, festival foods
- Never spam — one email per week, unsubscribe any time

Browse recipes: https://zaffaron.com/recipes

Cooking a new recipe? Tag us. We love seeing your tables.

---

Zaffaron · Authentic recipes from every kitchen
Unsubscribe: https://zaffaron.com/newsletter/unsubscribe?email=${encodeURIComponent(email)}
Privacy: https://zaffaron.com/privacy
`;
}
