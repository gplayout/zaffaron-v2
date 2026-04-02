import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export const metadata = {
  title: "Settings — Cook Dashboard",
  description: "Manage your cook profile settings on Zaffaron",
};

export default function SettingsPage() {
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
          <h1 className="text-2xl font-bold text-stone-900">Cook Settings</h1>
          <p className="text-stone-600">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <Settings className="h-8 w-8 text-stone-500" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-stone-900">Settings Coming Soon</h2>
        <p className="mt-2 text-stone-600">
          Once your cook application is approved, you&apos;ll be able to update your profile, availability, and preferences here.
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
