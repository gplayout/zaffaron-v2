import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl">🍳</p>
      <h1 className="mt-4 text-2xl font-bold">Recipe not found</h1>
      <p className="mt-2 text-stone-500">This recipe doesn&apos;t exist or was removed.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        Back to recipes
      </Link>
    </div>
  );
}
