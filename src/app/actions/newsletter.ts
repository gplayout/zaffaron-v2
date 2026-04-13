"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { headers } from "next/headers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter (per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max 5 subscribes per IP per hour
const RATE_WINDOW = 3600_000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
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
  if (!checkRateLimit(ip)) {
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    const supabase = supabaseServer;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer" });

    if (error) {
      if (error.code === "23505") {
        return { success: true, message: "You're already subscribed! 🧡" };
      }
      console.error("Newsletter subscribe error:", error.message);
      return { error: "Something went wrong. Please try again." };
    }

    return { success: true, message: "Welcome to Zaffaron! 🧡" };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
