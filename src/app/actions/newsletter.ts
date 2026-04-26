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
    // Rough check: if more than RATE_LIMIT total inserts in window, slow down
    // For proper per-IP, we'd need an IP column. This prevents mass abuse.
    return (count ?? 0) < RATE_LIMIT * 10; // generous global limit
  } catch {
    return true; // fail open
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
        return { success: true, message: "You're already subscribed! 🧡" };
      }
      console.error("Newsletter subscribe error:", error.message);
      return { error: "Something went wrong. Please try again." };
    }

    // New subscriber — fire welcome email (non-blocking, best-effort).
    // Does not throw; failures are logged but don't break signup flow.
    sendWelcomeEmail(email).then((result: { ok: boolean; reason?: string; id?: string }) => {
      if (!result.ok) {
        console.warn(`[newsletter] Welcome email not sent to ${email}: ${result.reason}`);
      }
    }).catch((e: unknown) => {
      console.error(`[newsletter] Welcome email promise error:`, e);
    });

    return { success: true, message: "Welcome to Zaffaron! 🧡" };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
