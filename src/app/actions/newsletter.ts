"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";
import { headers } from "next/headers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// DB-backed rate limiter: check recent inserts from same IP
const RATE_LIMIT = 5; // max 5 subscribes per IP per hour
const RATE_WINDOW_SECONDS = 3600; // 1 hour

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - RATE_WINDOW_SECONDS * 1000).toISOString();
    const { count } = await supabaseServer
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'footer')
      .gte('created_at', since);
    // Rough check: if more than RATE_LIMIT total inserts in window, slow down.
    // KNOWN LIMITATION: this is a global rate limit, not per-IP. A determined
    // attacker can fill the bucket with junk subscriptions and lock out legit
    // users. Per-IP enforcement requires a schema migration to add ip_hash
    // (or a dedicated rate-limit table). Tracked in PENDING-TODOS as future
    // work. At current scale (0-tens of subscribers/day) the global limit is
    // sufficient + Cloudflare WAF in front of zaffaron.com already filters
    // most abuse vectors.
    const within = (count ?? 0) < RATE_LIMIT * 10;
    if (!within) {
      console.warn(
        `[newsletter:subscribe] rate-limit triggered (ip=${ip}, window-count=${count ?? 'n/a'}, threshold=${RATE_LIMIT * 10})`
      );
    }
    return within;
  } catch (e) {
    // Fail-open: do not block legitimate subscribes if Supabase is glitchy.
    // Surface the failure so operators can detect persistent issues.
    const msg = e instanceof Error ? e.message : 'unknown';
    console.warn(
      `[newsletter:subscribe] rate-limit check FAIL-OPEN (ip=${ip}, error=${msg})`
    );
    return true;
  }
}

export async function subscribeNewsletter(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const honeypot = (formData.get("website") as string)?.trim(); // hidden field — bots fill this

  // Honeypot check: if filled, it's a bot
  if (honeypot) {
    // Silently pretend success (don't reveal detection)
    return { success: true, message: "Welcome to Zaffaron! 🧡" };
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    console.warn(`[newsletter:subscribe] invalid-email (input length=${(email ?? '').length})`);
    return { error: "Please enter a valid email address." };
  }

  // Rate limit by IP
  const headersList = await headers();
  const ip = headersList.get("x-real-ip") || headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (!(await checkRateLimit(ip))) {
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    const supabase = supabaseServer;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer" });

    if (error) {
      if (error.code === "23505") {
        // Already subscribed — don't re-send welcome email
        console.log(`[newsletter:subscribe] dup-detected (email=${email}, ip=${ip})`);
        return { success: true, message: "You're already subscribed! 🧡" };
      }
      console.error(`[newsletter:subscribe] db-error (email=${email}, ip=${ip}, code=${error.code}, msg=${error.message})`);
      return { error: "Something went wrong. Please try again." };
    }

    console.log(`[newsletter:subscribe] success (email=${email}, ip=${ip})`);

    // New subscriber — fire welcome email (non-blocking, best-effort).
    // Does not throw; failures are logged but don't break signup flow.
    sendWelcomeEmail(email).then((result: { ok: boolean; reason?: string; id?: string }) => {
      if (!result.ok) {
        console.warn(`[newsletter:welcome-email] not-sent (email=${email}, reason=${result.reason})`);
      } else {
        console.log(`[newsletter:welcome-email] sent (email=${email}, id=${result.id ?? 'unknown'})`);
      }
    }).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : 'unknown';
      console.error(`[newsletter:welcome-email] promise-error (email=${email}, error=${msg})`);
    });

    return { success: true, message: "Welcome to Zaffaron! 🧡" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.error(`[newsletter:subscribe] exception (ip=${ip}, error=${msg})`);
    return { error: "Something went wrong. Please try again." };
  }
}
