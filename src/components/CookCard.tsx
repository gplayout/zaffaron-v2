import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import type { Cook } from "@/types";

interface CookCardProps {
  cook: Cook;
}

export default function CookCard({ cook }: CookCardProps) {
  const initials = cook.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        {/* Avatar and Name Row */}
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-stone-100">
            {cook.avatar_url ? (
              <Image
                src={cook.avatar_url}
                alt={cook.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-amber-100 text-lg font-semibold text-amber-700">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-stone-900 group-hover:text-amber-700">
                {cook.name}
              </h3>
              {cook.verified && (
                <BadgeCheck className="h-5 w-5 flex-shrink-0 text-blue-500" aria-label="Verified cook" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-stone-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{cook.location}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-stone-900">{cook.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-stone-400">({cook.review_count} reviews)</span>
        </div>

        {/* Specialties */}
        {cook.specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cook.specialties.slice(0, 4).map((specialty: string) => (
              <span
                key={specialty}
                className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
              >
                {specialty}
              </span>
            ))}
            {cook.specialties.length > 4 && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                +{cook.specialties.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {cook.bio && (
          <p className="mt-3 line-clamp-2 text-sm text-stone-500">
            {cook.bio}
          </p>
        )}

        {/* View Menu Button */}
        <Link
          href={`/cook/${cook.id}`}
          className="mt-4 block w-full rounded-lg bg-amber-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
}
