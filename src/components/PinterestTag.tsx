"use client";
/**
 * Pinterest Tag (Conversion Tracking)
 *
 * Phase 3.5 (2026-05-04) — installed alongside Pinterest autopilot infrastructure.
 *
 * Pinterest's tag is a JS snippet that fires PageVisit on mount and exposes
 * window.pintrk(...) for custom event tracking (Search, AddToCart, Lead, etc.).
 *
 * Setup (Mehdi-action, post-Standard-API-approval):
 *   1. Pinterest Business Hub → Ads → Conversions → Get Pinterest tag
 *   2. Copy the 16-digit Tag ID
 *   3. Add to .env.local + Vercel env: NEXT_PUBLIC_PINTEREST_TAG_ID="<id>"
 *   4. Redeploy
 *
 * Until step 3, this component renders nothing (graceful no-op).
 *
 * Custom event tracking elsewhere in the app (when ready):
 *   window.pintrk?.('track', 'lead');     // newsletter signup
 *   window.pintrk?.('track', 'search', { search_query: q });  // search submit
 *   window.pintrk?.('track', 'addtocart', { product_id: slug });  // recipe save
 */

import Script from "next/script";

declare global {
  interface Window {
    pintrk?: (event: string, ...args: unknown[]) => void;
  }
}

export default function PinterestTag() {
  const tagId = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID;

  // Graceful no-op: if Tag ID isn't set, render nothing.
  if (!tagId) return null;

  // Sanity: Pinterest tag IDs are numeric (typically 13-16 digits).
  // Reject obviously malformed values so we don't ship broken script tags.
  if (!/^\d{10,20}$/.test(tagId)) {
    if (typeof window !== "undefined") {
      console.warn(`[PinterestTag] NEXT_PUBLIC_PINTEREST_TAG_ID="${tagId}" doesn't look like a valid numeric tag id; skipping.`);
    }
    return null;
  }

  return (
    <>
      <Script
        id="pinterest-tag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
  n=window.pintrk;n.queue=[],n.version="3.0";var
  t=document.createElement("script");t.async=!0,t.src=e;var
  r=document.getElementsByTagName("script")[0];
  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '${tagId}', { em: '<user_email_address>' });
pintrk('page');
          `.trim(),
        }}
      />
      {/* Fallback noscript pixel for non-JS environments */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://ct.pinterest.com/v3/?event=init&tid=${tagId}&pd[em]=<hashed_email_address>&noscript=1`}
        />
      </noscript>
    </>
  );
}
