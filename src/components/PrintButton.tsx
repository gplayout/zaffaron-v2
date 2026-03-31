"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100"
    >
      <Printer className="h-4 w-4" /> Print Recipe
    </button>
  );
}
