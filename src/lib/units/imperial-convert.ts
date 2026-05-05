/**
 * Imperial conversion library — Phase 6.6 γ implementation (2026-05-05).
 *
 * Pure deterministic conversion from metric (canonical storage) to imperial
 * (US-friendly display). No round-trip, no precision loss in storage.
 *
 * Mehdi 2026-05-05 03:16 PDT GO Option γ: computed display layer only.
 * No DB schema change. No backfill. Works on all 1,926+ existing recipes.
 *
 * Friend feedback: "I think it would be much better if the recipes had the
 * 'English' measuring system also." This addresses that.
 *
 * Cooking-precision rounding: imperial values are rounded to user-friendly
 * fractions (½, ¼, ⅓, ⅛) where natural; otherwise to 1 decimal.
 */

export type UnitSystem = "metric" | "imperial";

/**
 * Format an ingredient line per the user's preferred unit system.
 *
 * Metric units we know how to convert: g, ml, tsp, tbsp, cup
 * Other units (bunch, "", etc.) pass through unchanged.
 */
export interface FormattedIngredient {
  amount: string;     // user-readable (may be fraction like "1½", "¾")
  unit: string;       // "" if unitless, otherwise metric or imperial
}

/**
 * Convert (amount, unit) from metric to imperial display.
 * Returns formatted strings ready to render.
 */
export function formatIngredient(
  amount: number | string | null | undefined,
  unit: string | null | undefined,
  system: UnitSystem = "metric"
): FormattedIngredient {
  const u = (unit || "").toLowerCase().trim();
  const amt = typeof amount === "number" ? amount : parseFloat(String(amount ?? ""));
  const safeAmt = Number.isFinite(amt) ? amt : null;

  // System=metric: pass through (canonical storage form)
  if (system === "metric") {
    return {
      amount: safeAmt !== null ? formatMetricAmount(safeAmt) : String(amount ?? ""),
      unit: u,
    };
  }

  // System=imperial: convert known metric units
  if (safeAmt === null) return { amount: String(amount ?? ""), unit: u };

  switch (u) {
    case "g": {
      // Below 28g: use teaspoons/tbsp approximations are misleading for solids.
      // Stick with "Xg" or convert to oz when ≥ 28g.
      if (safeAmt >= 28) {
        const oz = safeAmt / 28.3495;
        if (safeAmt >= 454) {
          const lb = safeAmt / 453.592;
          return { amount: roundFriendly(lb), unit: "lb" };
        }
        return { amount: roundFriendly(oz), unit: "oz" };
      }
      // Small gram quantities: keep grams (no clean imperial equiv for spice-level)
      return { amount: roundFriendly(safeAmt), unit: "g" };
    }
    case "ml": {
      // Below 5ml: keep ml (would be "<1 tsp"). 5-15ml → tsp. 15-240ml → tbsp/cup. >240 → cup.
      if (safeAmt < 5) return { amount: roundFriendly(safeAmt), unit: "ml" };
      if (safeAmt < 15) {
        const tsp = safeAmt / 4.92892;
        return { amount: roundFriendly(tsp), unit: "tsp" };
      }
      if (safeAmt < 240) {
        // Prefer tbsp for 15-60ml; cup-fraction for 60-240ml
        if (safeAmt < 60) {
          const tbsp = safeAmt / 14.7868;
          return { amount: roundFriendly(tbsp), unit: "tbsp" };
        }
        const cup = safeAmt / 236.588;
        return { amount: roundFriendly(cup), unit: "cup" };
      }
      const cup = safeAmt / 236.588;
      return { amount: roundFriendly(cup), unit: "cup" };
    }
    case "tsp":
    case "tbsp":
    case "cup":
      // Already imperial-compatible; pass through with friendly rounding
      return { amount: roundFriendly(safeAmt), unit: u };
    case "bunch":
    case "":
      // Unitless or unconvertible; pass through
      return { amount: roundFriendly(safeAmt), unit: u };
    default:
      // Unknown unit — pass through unchanged
      return { amount: roundFriendly(safeAmt), unit: u };
  }
}

/**
 * Metric-side formatting (handles fractional amounts 0.5 → "½").
 */
export function formatMetricAmount(amt: number): string {
  if (!Number.isFinite(amt)) return String(amt);
  const rounded = Math.round(amt * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toString();
}

/**
 * Round to cooking-friendly fractions (½, ¼, ⅓, ⅛).
 * Returns a string like "1½", "¾", "2⅓", "0.7" (fall-back when no clean fraction).
 */
function roundFriendly(amt: number): string {
  if (!Number.isFinite(amt)) return "0";
  if (amt === 0) return "0";

  const sign = amt < 0 ? "-" : "";
  const abs = Math.abs(amt);

  // For amounts ≥ 10: round to nearest 0.5 → string with single decimal
  if (abs >= 10) {
    const r = Math.round(abs * 2) / 2;
    if (Number.isInteger(r)) return sign + String(r);
    return sign + r.toFixed(1).replace(/\.0$/, "");
  }

  // For amounts ≥ 1 and < 10: try to express as integer + fraction
  const whole = Math.floor(abs);
  const frac = abs - whole;
  const fracChar = nearestFraction(frac);

  if (fracChar === "") {
    // No clean fraction — fallback to decimal
    if (whole === 0) return sign + abs.toFixed(2).replace(/\.?0+$/, "");
    return sign + abs.toFixed(1).replace(/\.0$/, "");
  }

  // Whole part is 0 → just the fraction (e.g. "½")
  if (whole === 0 && fracChar) return sign + fracChar;
  return sign + whole + fracChar;
}

/**
 * Find nearest cooking fraction within tolerance 0.04.
 * Returns the unicode fraction char or "" if no good match.
 */
function nearestFraction(frac: number): string {
  const candidates: Array<[number, string]> = [
    [0,        ""],
    [1 / 8,    "⅛"],
    [1 / 4,    "¼"],
    [1 / 3,    "⅓"],
    [3 / 8,    "⅜"],
    [1 / 2,    "½"],
    [5 / 8,    "⅝"],
    [2 / 3,    "⅔"],
    [3 / 4,    "¾"],
    [7 / 8,    "⅞"],
    [1,        ""], // whole — caller should bump whole instead
  ];

  let best = "";
  let bestDelta = Infinity;
  for (const [v, ch] of candidates) {
    const delta = Math.abs(frac - v);
    if (delta < bestDelta && delta < 0.04) {
      bestDelta = delta;
      best = ch;
    }
  }
  return best;
}

/**
 * Convert temperature for oven instructions etc.
 * 200°C → 392°F (we'd round to 400°F for cooking)
 */
export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}
