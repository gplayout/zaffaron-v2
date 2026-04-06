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
        Zaffaron is a recipe website. We collect the following data:
      </p>
      <ul>
        <li><strong>Account information:</strong> If you create an account (via email/password or Google sign-in), we store your email address and display name. This is used for authentication and personalization (favorites, reviews).</li>
        <li><strong>Cookies:</strong> We use essential cookies for authentication (session management via Supabase). We do not use tracking cookies or third-party advertising cookies.</li>
        <li><strong>Analytics:</strong> We use Vercel Analytics to understand how visitors use our site. This includes page views, device type, and country. No personally identifiable information is collected by analytics.</li>
        <li><strong>User-generated content:</strong> Recipe reviews, ratings, favorites, and cook applications are stored in our database and associated with your account.</li>
        <li><strong>Contact messages:</strong> If you use our contact form, we store your name, email, and message to respond to your inquiry.</li>
      </ul>

      <h2>How We Use Your Data</h2>
      <ul>
        <li>To provide and improve our recipe platform</li>
        <li>To personalize your experience (favorites, reviews)</li>
        <li>To respond to contact form inquiries</li>
        <li>To process cook applications for our marketplace</li>
      </ul>

      <h2>Third-Party Services</h2>
      <ul>
        <li><strong>Supabase:</strong> Authentication and database hosting</li>
        <li><strong>Vercel:</strong> Website hosting and analytics</li>
        <li><strong>Google:</strong> OAuth sign-in (if you choose Google login)</li>
      </ul>

      <h2>Data Retention</h2>
      <p>Your account data is retained as long as your account is active. You can request deletion of your account and associated data by contacting us.</p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email us at{" "}
        <a href="mailto:hello@zaffaron.com">hello@zaffaron.com</a>.
      </p>
    </article>
  );
}
