export default function CategoryLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5">
        <div className="h-4 w-10 rounded bg-stone-200" />
        <div className="h-4 w-2 rounded bg-stone-200" />
        <div className="h-4 w-24 rounded bg-stone-200" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="h-10 w-3/4 rounded bg-stone-200" />
        <div className="mt-3 h-6 w-full max-w-2xl rounded bg-stone-200" />
        <div className="mt-2 h-5 w-32 rounded bg-stone-200" />
      </div>

      {/* Recipe grid - 6 cards */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <li key={i}>
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-stone-200" />
              <div className="p-4">
                {/* Category */}
                <div className="mb-1 h-4 w-24 rounded bg-stone-200" />
                {/* Title */}
                <div className="h-6 w-full rounded bg-stone-200" />
                {/* Description */}
                <div className="mt-1 h-4 w-full rounded bg-stone-200" />
                <div className="mt-1 h-4 w-2/3 rounded bg-stone-200" />
                {/* Meta */}
                <div className="mt-3 flex items-center gap-4">
                  <div className="h-3.5 w-16 rounded bg-stone-200" />
                  <div className="h-3.5 w-14 rounded bg-stone-200" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination placeholder */}
      <div className="mt-10 flex justify-center gap-2">
        <div className="h-10 w-24 rounded-lg bg-stone-200" />
        <div className="h-10 w-20 rounded-lg bg-stone-200" />
        <div className="h-10 w-24 rounded-lg bg-stone-200" />
      </div>
    </div>
  );
}
