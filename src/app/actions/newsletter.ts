"use server";

import { supabaseServer } from "@/lib/supabase-server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const supabase = supabaseServer;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer" });

    if (error) {
      if (error.code === "23505") {
        // Unique constraint = already subscribed
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
