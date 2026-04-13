import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Global Food Calendar — Cultural Food Events Worldwide",
  description:
    "Discover what the world eats and why. A curated calendar of cultural, religious, and seasonal food traditions from 35+ cultures — from Nowruz to Diwali, Ramadan to Thanksgiving.",
  alternates: { canonical: "/calendar" },
};

interface CalendarEvent {
  slug: string;
  name: string;
  name_local: string | null;
  event_type: string;
  tier: number;
  start_month: number | null;
  regions: string[];
  cuisines: string[];
  cultural_context: string | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_EMOJI = ["❄️", "💝", "🌸", "🌷", "🌺", "☀️", "🏖️", "🌻", "🍂", "🎃", "🍁", "🎄"];

export default async function CalendarPage() {
  const { data: events } = await supabaseServer
    .from("calendar_events")
    .select("slug, name, name_local, event_type, tier, start_month, regions, cuisines, cultural_context")
    .eq("published", true)
    .order("start_month", { ascending: true, nullsFirst: false })
    .order("tier", { ascending: true });

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">🗓️ Global Food Calendar</h1>
        <p className="text-stone-500">Coming soon — cultural food events from around the world.</p>
      </div>
    );
  }

  // Group by month
  const byMonth: Record<number, CalendarEvent[]> = {};
  const undated: CalendarEvent[] = [];

  for (const ev of events as CalendarEvent[]) {
    if (ev.start_month && ev.start_month >= 1 && ev.start_month <= 12) {
      if (!byMonth[ev.start_month]) byMonth[ev.start_month] = [];
      byMonth[ev.start_month].push(ev);
    } else {
      undated.push(ev);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">🗓️ Global Food Calendar</h1>
      <p className="text-stone-500 mb-8 max-w-2xl">
        What the world eats — and why. Cultural, religious, and seasonal food traditions from 35+ cultures.
      </p>

      <div className="space-y-10">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
          const monthEvents = byMonth[month];
          if (!monthEvents || monthEvents.length === 0) return null;

          return (
            <section key={month} id={MONTH_NAMES[month - 1].toLowerCase()}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {MONTH_EMOJI[month - 1]} {MONTH_NAMES[month - 1]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {monthEvents.map((ev) => (
                  <Link
                    key={ev.slug}
                    href={`/calendar/${ev.slug}`}
                    className="block rounded-xl border border-stone-200 p-4 transition hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-stone-900">{ev.name}</h3>
                      {ev.tier === 1 && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Major
                        </span>
                      )}
                    </div>
                    {ev.name_local && (
                      <p className="text-sm text-stone-400 mt-0.5">{ev.name_local}</p>
                    )}
                    <p className="text-sm text-stone-500 mt-2 line-clamp-2">
                      {ev.cultural_context?.slice(0, 120)}...
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {ev.cuisines?.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {undated.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">📅 Variable Dates</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {undated.map((ev) => (
                <Link
                  key={ev.slug}
                  href={`/calendar/${ev.slug}`}
                  className="block rounded-xl border border-stone-200 p-4 transition hover:border-amber-300 hover:shadow-md"
                >
                  <h3 className="font-medium text-stone-900">{ev.name}</h3>
                  {ev.name_local && (
                    <p className="text-sm text-stone-400 mt-0.5">{ev.name_local}</p>
                  )}
                  <p className="text-sm text-stone-500 mt-2 line-clamp-2">
                    {ev.cultural_context?.slice(0, 120)}...
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
