export default function RecipeDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex items-center gap-1.5">
        <div className="h-4 w-10 rounded bg-stone-200" />
        <div className="h-4 w-2 rounded bg-stone-200" />
        <div className="h-4 w-16 rounded bg-stone-200" />
        <div className="h-4 w-2 rounded bg-stone-200" />
        <div className="h-4 w-14 rounded bg-stone-200" />
        <div className="h-4 w-2 rounded bg-stone-200" />
        <div className="h-4 w-32 rounded bg-stone-200" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-stone-200" />
          <div className="h-4 w-2 rounded bg-stone-200" />
          <div className="h-4 w-16 rounded bg-stone-200" />
        </div>
        <div className="h-10 w-3/4 rounded bg-stone-200" />
        <div className="mt-3 h-6 w-full rounded bg-stone-200" />
        <div className="mt-2 h-6 w-2/3 rounded bg-stone-200" />
        
        {/* Author & Date */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-stone-200" />
          <div className="h-4 w-2 rounded bg-stone-200" />
          <div className="h-4 w-32 rounded bg-stone-200" />
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="h-8 w-28 rounded-full bg-stone-200" />
          <div className="h-8 w-36 rounded-full bg-stone-200" />
          <div className="h-8 w-24 rounded-full bg-stone-200" />
        </div>
      </div>

      {/* Image */}
      <div className="mb-8 aspect-video w-full rounded-xl bg-stone-200" />

      {/* Content grid */}
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* Ingredients */}
        <div>
          <div className="mb-4 h-7 w-28 rounded bg-stone-200" />
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-5 w-20 rounded bg-stone-200" />
                <div className="h-5 w-full rounded bg-stone-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <div className="mb-4 h-7 w-28 rounded bg-stone-200" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-7 w-7 shrink-0 rounded-full bg-stone-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-full rounded bg-stone-200" />
                  <div className="h-5 w-5/6 rounded bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
