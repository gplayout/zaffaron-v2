import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "How Zaffaron tests and verifies every recipe before publishing.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="prose prose-stone mx-auto max-w-2xl">
      <h1>Editorial Policy</h1>

      <p>
        At Zaffaron, &quot;verified&quot; is not a marketing word — it is a process.
        Every recipe on this site goes through a structured quality review before
        it reaches you.
      </p>

      <h2>Our Recipe Testing Process</h2>
      <ol>
        <li>
          <strong>Research:</strong> Each recipe begins with research across
          multiple authoritative sources — traditional cookbooks, respected chef
          references, and established culinary publications.
        </li>
        <li>
          <strong>Drafting:</strong> A detailed recipe draft is created with exact
          measurements, clear step-by-step instructions, and realistic time estimates.
        </li>
        <li>
          <strong>Cross-Verification:</strong> Every recipe is cross-referenced
          against at least two independent, reputable sources to verify ingredient
          ratios, cooking times, and techniques.
        </li>
        <li>
          <strong>Quality Checklist:</strong> Before publishing, each recipe must
          pass our automated and manual quality checks:
          <ul>
            <li>All ingredients appear in the instructions</li>
            <li>Measurements are realistic for the stated servings</li>
            <li>Cooking times are achievable</li>
            <li>Instructions are clear enough for a beginner</li>
            <li>Food safety practices are followed</li>
          </ul>
        </li>
        <li>
          <strong>Publishing:</strong> Only recipes that pass all checks are
          marked as verified and published to the site.
        </li>
      </ol>

      <h2>Verification Levels</h2>
      <ul>
        <li><strong>Verified:</strong> Fully reviewed, cross-referenced, and quality-checked.</li>
        <li><strong>Reviewed:</strong> Reviewed by our team but pending final verification.</li>
      </ul>

      <h2>Corrections</h2>
      <p>
        Found an error? We take corrections seriously. Please email{" "}
        <a href="mailto:hello@zaffaron.com">hello@zaffaron.com</a> with the
        recipe name and the issue you found. We will investigate and update
        the recipe promptly.
      </p>

      <h2>AI Assistance Disclosure</h2>
      <p>
        We use AI tools to assist with recipe research, drafting, and formatting.
        However, every recipe undergoes human editorial review and verification
        before publication. AI is a tool in our process, not a replacement for
        culinary knowledge and accuracy.
      </p>
    </article>
  );
}
