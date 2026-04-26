import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export const metadata = {
  title: "Unsubscribe — Zaffaron",
  robots: { index: false, follow: false },
};

type SearchParams = { email?: string };

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase();

  if (!email) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">Unsubscribe</h1>
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            To unsubscribe, please use the link in an email we've sent you.
          </p>
          <Link href="/" className="text-amber-600 hover:text-amber-700 underline">
            Return home
          </Link>
        </div>
      </main>
    );
  }

  // Mark as unsubscribed (soft-delete via active=false if column exists)
  // Fallback: hard delete from newsletter_subscribers
  let success = false;
  let reason = "";
  try {
    // Try soft-delete first (newsletter_subscribers has unsubscribed_at per schema)
    const { error } = await supabaseServer
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString(), active: false })
      .eq("email", email);
    if (error) {
      // Fallback: hard delete
      const del = await supabaseServer.from("newsletter_subscribers").delete().eq("email", email);
      if (del.error) {
        reason = del.error.message;
      } else {
        success = true;
      }
    } else {
      success = true;
    }
  } catch (e) {
    reason = e instanceof Error ? e.message : "unknown";
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        {success ? (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
              You've been unsubscribed 🧡
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              We're sorry to see you go. If this was a mistake, you can always resubscribe on our homepage.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
              Something went wrong
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              We couldn't process your unsubscribe request. Please reply to any of our emails and we'll handle it manually.
              {reason && <span className="block mt-2 text-xs text-stone-500 font-mono">{reason}</span>}
            </p>
          </>
        )}
        <Link href="/" className="text-amber-600 hover:text-amber-700 underline">
          Return home
        </Link>
      </div>
    </main>
  );
}
