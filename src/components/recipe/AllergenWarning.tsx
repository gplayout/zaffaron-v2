import { AlertTriangle } from "lucide-react";
import type { Recipe } from "@/types";

interface AllergenWarningProps {
  dietary: Recipe["dietary_info"];
}

export function AllergenWarning({ dietary }: AllergenWarningProps) {
  const allergens = dietary?.allergens;
  if (!allergens || !Array.isArray(allergens) || allergens.length === 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
      <div>
        <span className="font-medium text-amber-800">Contains: </span>
        <span className="text-amber-700">{allergens.map(a => String(a).replace(/[<>&"']/g, '')).join(", ")}</span>
      </div>
    </div>
  );
}
