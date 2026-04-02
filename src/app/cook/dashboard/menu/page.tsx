import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";

export const metadata = {
  title: "Menu Management — Cook Dashboard",
  description: "Manage your menu items on Zaffaron",
};

export default function MenuPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/cook/dashboard"
          className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Menu Management</h1>
          <p className="text-stone-600">Add and manage your menu items</p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <UtensilsCrossed className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-stone-900">Menu Coming Soon</h2>
        <p className="mt-2 text-stone-600">
          Once your cook application is approved, you&apos;ll be able to create and manage your menu items here.
        </p>
        <Link
          href="/cook/dashboard"
          className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
