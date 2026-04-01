"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  disabled?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
  disabled = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (starIndex: number) => {
    if (interactive && !disabled && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (interactive && !disabled) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive && !disabled) {
      setHoverRating(0);
    }
  };

  const renderStar = (starIndex: number) => {
    const filled = starIndex <= Math.floor(displayRating);
    const partial = !filled && starIndex === Math.ceil(displayRating);
    const partialPercent = partial ? (displayRating % 1) * 100 : 0;

    return (
      <button
        key={starIndex}
        type="button"
        onClick={() => handleClick(starIndex)}
        onMouseEnter={() => handleMouseEnter(starIndex)}
        onMouseLeave={handleMouseLeave}
        disabled={!interactive || disabled}
        className={`relative ${interactive && !disabled ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform disabled:opacity-50`}
        aria-label={`${starIndex} star${starIndex !== 1 ? "s" : ""}`}
      >
        {/* Background star (empty) */}
        <Star
          className={`${sizeClasses[size]} text-stone-300`}
          fill="currentColor"
        />
        
        {/* Filled star overlay */}
        {(filled || partial) && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: partial ? `${partialPercent}%` : "100%" }}
          >
            <Star
              className={`${sizeClasses[size]} text-amber-500`}
              fill="currentColor"
            />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => renderStar(i + 1))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-medium text-stone-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
