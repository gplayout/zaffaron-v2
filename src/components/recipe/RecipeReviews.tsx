"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { User, Calendar, MessageSquare, Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  createdAt: string;
}

interface RecipeReviewsProps {
  reviews?: Review[];
  recipeId?: string;
}

export function RecipeReviews({ reviews = [], recipeId }: RecipeReviewsProps) {
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRating === 0) {
      alert("Please select a star rating");
      return;
    }

    setIsSubmitting(true);

    // TODO: Connect to backend
    console.log("Submitting review:", {
      recipeId,
      rating: userRating,
      text: reviewText,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setUserRating(0);
    setReviewText("");

    // Hide success message after 3 seconds
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="mt-12 border-t border-stone-200 pt-8">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-stone-800">
        <MessageSquare className="h-6 w-6 text-amber-600" />
        Reviews
      </h2>

      {/* Rating Summary */}
      <div className="mb-8 rounded-xl bg-stone-50 p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-stone-800">
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </div>
            <div className="mt-1">
              <StarRating rating={averageRating} size="sm" />
            </div>
            <div className="mt-1 text-sm text-stone-500">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-stone-600">{star}</span>
                    <Star className="h-3 w-3 text-amber-500" fill="currentColor" />
                    <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-stone-500">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Write a Review Form */}
      <div className="mb-8 rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-800">
          Write a Review
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Your Rating
            </label>
            <StarRating
              rating={userRating}
              interactive
              onRatingChange={setUserRating}
              size="lg"
            />
          </div>

          <div>
            <label
              htmlFor="review-text"
              className="mb-2 block text-sm font-medium text-stone-700"
            >
              Your Review
            </label>
            <textarea
              id="review-text"
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this recipe..."
              className="w-full rounded-lg border border-stone-300 px-4 py-3 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || userRating === 0}
            className="rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>

          {submitSuccess && (
            <p className="text-sm font-medium text-emerald-600">
              Thank you! Your review has been submitted.
            </p>
          )}
        </form>
      </div>

      {/* Existing Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <User className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-stone-800">
                    {review.authorName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <StarRating rating={review.rating} size="sm" />
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-stone-700 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-stone-400" />
          <p className="mt-3 text-stone-600">
            No reviews yet. Be the first to review this recipe!
          </p>
        </div>
      )}
    </section>
  );
}
