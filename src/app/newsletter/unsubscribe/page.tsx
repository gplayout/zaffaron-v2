import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyUnsubscribeToken } from "@/lib/newsletter/unsubscribe-token";

export const metadata = {
  title: "Unsubscribe — Zaffaron",
  robots: { index: false, follow: false },
};

type SearchParams = {
  // New: HMAC-signed token (preferred, only path that mutates DB)
  t?: string;
  // Legacy: bare email param. Pre-fix this triggered DB writes.
  // Post-fix this is informational-only and refuses destructive action.
  email?: string;
};

type UnsubState =
  | { kind: "no-input" }
  | { kind: "legacy-email-only" }
  | { kind: "token-rejected"; reason: "malformed" | "expired" | "invalid_signature" | "no_secret" }
  | { kind: "success"; email: string }
  | { kind: "db-error"; email: string; reason: string };

async function processUnsubscribe(searchParams: SearchParams): Promise<UnsubState> {
  const token = typeof searchParams.t === "string" ? searchParams.t.trim() : "";
  const legacyEmail = typeof searchParams.email === "string" ? searchParams.email.trim().toLowerCase() : "";

  // Token path (post-fix, the only path that mutates DB)
  if (token) {
    const verifyResult = verifyUnsubscribeToken(token);
    if (!verifyResult.ok) {
      console.warn(
        `[newsletter:unsubscribe] token rejected (reason=${verifyResult.reason})`
      );
      return { kind: "token-rejected", reason: verifyResult.reason };
    }

    const email = verifyResult.email.toLowerCase();

    // Service-role client used here because the unsubscriber is NOT logged in.
    // Authentication came from the HMAC-signed token (proof of inbox ownership);
    // bypass RLS to perform the privileged update.
    let admin;
    try {
      admin = supabaseAdmin();
    } catch (e) {
      const reason = e instanceof Error ? e.message : "admin-init-failed";
      console.error(`[newsletter:unsubscribe] admin client init failed: ${reason}`);
      return { kind: "db-error", email, reason };
    }

    // Soft-delete (mark unsubscribed_at + active=false). Schema has these columns;
    // if not, ascend to hard delete as last resort.
    const { error: updateErr } = await admin
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString(), active: false })
      .eq("email", email);

    if (updateErr) {
      console.warn(
        `[newsletter:unsubscribe] soft-delete failed (email=${email}, code=${updateErr.code}, msg=${updateErr.message}); attempting hard delete`
      );
      const { error: deleteErr } = await admin
        .from("newsletter_subscribers")
        .delete()
        .eq("email", email);
      if (deleteErr) {
        console.error(
          `[newsletter:unsubscribe] hard delete also failed (email=${email}, code=${deleteErr.code}, msg=${deleteErr.message})`
        );
        return { kind: "db-error", email, reason: deleteErr.message };
      }
    }

    console.log(`[newsletter:unsubscribe] success (email=${email})`);
    return { kind: "success", email };
  }

  // Legacy email-only path: pre-fix would have unsubscribed; post-fix refuses.
  if (legacyEmail) {
    console.warn(
      `[newsletter:unsubscribe] legacy email-only request rejected (email=${legacyEmail})`
    );
    return { kind: "legacy-email-only" };
  }

  return { kind: "no-input" };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const state = await processUnsubscribe(params);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        {state.kind === "success" && (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
              You&apos;ve been unsubscribed 🧡
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              We&apos;re sorry to see you go. If this was a mistake, you can always resubscribe on our homepage.
            </p>
          </>
        )}

        {state.kind === "no-input" && (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">Unsubscribe</h1>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              To unsubscribe, please use the link in an email we&apos;ve sent you.
            </p>
          </>
        )}

        {state.kind === "legacy-email-only" && (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
              Unsubscribe link required
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Please use the unsubscribe link inside one of our emails. The link contains a secure token that proves it&apos;s you.
            </p>
            <p className="text-stone-500 text-xs mb-6">
              If you can&apos;t find a recent email, reply to any of our emails and we&apos;ll handle the unsubscribe manually.
            </p>
          </>
        )}

        {state.kind === "token-rejected" && (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
              {state.reason === "expired" ? "Link expired" : "Invalid unsubscribe link"}
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              {state.reason === "expired"
                ? "This unsubscribe link is older than one year. Please reply to any of our emails and we'll handle the unsubscribe manually."
                : "The unsubscribe link appears tampered or malformed. Please reply to any of our emails and we'll handle the unsubscribe manually."}
            </p>
          </>
        )}

        {state.kind === "db-error" && (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
              Something went wrong
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              We couldn&apos;t process your unsubscribe request. Please reply to any of our emails and we&apos;ll handle it manually.
              <span className="block mt-2 text-xs text-stone-500 font-mono">{state.reason}</span>
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
