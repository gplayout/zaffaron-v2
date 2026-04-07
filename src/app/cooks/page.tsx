import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cook Marketplace — Coming Soon",
  description: "We're building a platform to connect you with talented home cooks. Order authentic homemade meals from your neighborhood.",
};

export default function CooksPage() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <p className="text-6xl">👨‍🍳</p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        Cook Marketplace
      </h1>
      <p className="mt-2 text-lg text-amber-600 font-semibold">Coming Soon</p>
      <p className="mt-4 text-stone-600 leading-relaxed">
        We&apos;re building a platform to connect you with talented home cooks
        in your area. Browse menus, read reviews, and order authentic homemade
        meals — all from the comfort of your home.
      </p>

      <div className="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-8">
        <h2 className="text-lg font-bold text-stone-800">What to expect:</h2>
        <ul className="mt-4 space-y-3 text-left text-stone-600">
          <li className="flex items-start gap-3">
            <span className="text-amber-600">✓</span>
            <span>Browse local home cooks and their specialties</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">✓</span>
            <span>View menus with authentic recipes from 8+ cuisines</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">✓</span>
            <span>Read verified reviews from real customers</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600">✓</span>
            <span>Order fresh, homemade meals for pickup or delivery</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/cook/apply"
          className="rounded-lg bg-amber-600 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-amber-700"
        >
          Apply to Be a Cook
        </Link>
        <Link
          href="/recipes"
          className="rounded-lg border border-stone-300 bg-white px-8 py-3 font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Browse Recipes
        </Link>
      </div>
    </div>
  );
}
