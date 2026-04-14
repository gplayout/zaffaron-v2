import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use, copyright policy, and content licensing for Zaffaron.com recipes and images.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  const year = new Date().getFullYear();

  return (
    <article className="prose prose-stone mx-auto max-w-2xl">
      <h1>Terms of Use</h1>
      <p className="lead">Last updated: March {year}</p>

      <h2>Copyright</h2>
      <p>
        All content on Zaffaron.com — including recipes, photographs, text, graphics, and other materials — is
        the property of Zaffaron and is protected by international copyright laws.
        © {year} Zaffaron. All rights reserved.
      </p>

      <h2>Permitted Use</h2>
      <ul>
        <li>You may view, print, and share recipes for <strong>personal, non-commercial use</strong>.</li>
        <li>You may link to any page on Zaffaron.com from your website or social media.</li>
        <li>You may share a short excerpt (up to 100 words) with proper attribution and a link back to the original recipe.</li>
      </ul>

      <h2>Prohibited Use</h2>
      <ul>
        <li>Republishing full recipes or images without written permission.</li>
        <li>Scraping, crawling, or automated collection of content for any purpose, including AI/ML training.</li>
        <li>Using our photographs on other websites, apps, or publications without a license.</li>
        <li>Removing or altering any copyright notices or watermarks.</li>
      </ul>

      <h2>AI & Machine Learning</h2>
      <p>
        The use of Zaffaron content to train, fine-tune, or otherwise develop artificial intelligence or machine learning
        models is expressly prohibited without prior written consent. This includes but is not limited to large language
        models, image generation models, and recommendation systems.
      </p>

      <h2>DMCA & Content Takedown</h2>
      <p>
        If you believe your copyrighted work has been used on Zaffaron without authorization, or if you find Zaffaron
        content republished without permission, please contact us at{" "}
        <a href="mailto:hello@zaffaron.com">hello@zaffaron.com</a> with:
      </p>
      <ul>
        <li>A description of the copyrighted work.</li>
        <li>The URL where the infringing content appears.</li>
        <li>Your contact information.</li>
      </ul>

      <h2>Image Licensing</h2>
      <p>
        All food photography on Zaffaron is original. For licensing inquiries (editorial, commercial, or print),
        contact <a href="mailto:hello@zaffaron.com">hello@zaffaron.com</a>.
      </p>

      <h2>Disclaimer</h2>
      <p>
        Recipes are provided for informational purposes. Zaffaron is not responsible for any adverse reactions
        to food prepared based on our recipes. Always check for allergens and consult a medical professional
        if you have dietary restrictions.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of Zaffaron.com constitutes acceptance
        of the current terms.
      </p>

      <hr />
      <p className="text-sm text-stone-500">
        Questions? Email <a href="mailto:hello@zaffaron.com">hello@zaffaron.com</a> ·{" "}
        <Link href="/privacy">Privacy Policy</Link> ·{" "}
        <Link href="/editorial-policy">Editorial Policy</Link>
      </p>
    </article>
  );
}
