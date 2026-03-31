import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Zaffaron privacy policy — how we handle your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-stone mx-auto max-w-2xl">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: March 2026</em></p>

      <h2>What We Collect</h2>
      <p>
        Zaffaron is a recipe website. We collect minimal data:
      </p>
      <ul>
        <li><strong>Analytics:</strong> We use Vercel Analytics to understand how visitors use our site. This includes page views, device type, and country. No personally identifiable information is collected.</li>
        <li><strong>No accounts:</strong> We do not currently require user accounts or collect personal information.</li>
        <li><strong>No cookies:</strong> We do not use tracking cookies or third-party advertising.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email us at{" "}
        <a href="mailto:hello@zaffaron.com">hello@zaffaron.com</a>.
      </p>
    </article>
  );
}
