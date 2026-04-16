"use client";
// Client-only component — no server dependencies
import { useState } from "react";
import { Mic } from "lucide-react";

export default function AudioRecorder() {
  const [ready] = useState(true);
  return (
    <div className="p-4 text-center text-stone-500 dark:text-stone-400">
      <Mic className="h-8 w-8 mx-auto mb-2 text-amber-600" />
      <p>{ready ? "Voice recording coming soon" : "Loading..."}</p>
    </div>
  );
}
