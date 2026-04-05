import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="text-6xl">🍳</p>
      <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
      <p className="mt-2 text-stone-500">
        This page doesn&apos;t exist or may have moved.
      </p>

      {/* Search suggestion */}
      <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-6">
        <p className="text-sm font-medium text-stone-700 mb-3">Looking for a recipe?</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-stone-500 shadow-sm transition hover:border-amber-300 hover:shadow-md"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search 1,500+ recipes
        </Link>
      </div>

      {/* Browse by cuisine */}
      <div className="mt-6">
        <p className="text-sm text-stone-400 mb-3">Or browse by cuisine:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { emoji: "🇮🇷", name: "Persian", slug: "persian" },
            { emoji: "🇹🇷", name: "Turkish", slug: "turkish" },
            { emoji: "🇮🇳", name: "Indian", slug: "indian" },
            { emoji: "🇱🇧", name: "Lebanese", slug: "lebanese" },
            { emoji: "🇲🇦", name: "Moroccan", slug: "moroccan" },
            { emoji: "🇬🇷", name: "Greek", slug: "greek" },
          ].map((c) => (
            <Link
              key={c.slug}
              href={`/cuisine/${c.slug}`}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
