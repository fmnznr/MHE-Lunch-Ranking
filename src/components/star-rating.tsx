"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitRating } from "@/lib/actions/ratings";
import { Confetti } from "./confetti";

interface StarRatingProps {
  dishId: string;
  initialRating?: number | null;
  disabled?: boolean;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-10 h-10 sm:w-12 sm:h-12"
      fill={filled ? "#C9A84C" : "none"}
      stroke="#C9A84C"
      strokeWidth={1.5}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function StarRating({ dishId, initialRating, disabled }: StarRatingProps) {
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [submitted, setSubmitted] = useState(!!initialRating);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async (stars: number) => {
    if (submitted || disabled || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const result = await submitRating(dishId, stars);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setRating(stars);
    setSubmitted(true);
    setShowConfetti(true);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={submitted || disabled || isSubmitting}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !submitted && setHover(star)}
            onMouseLeave={() => !submitted && setHover(0)}
            animate={{
              scale: !submitted && star <= hover ? 1.2 : 1,
              filter:
                !submitted && star <= hover
                  ? "drop-shadow(0 0 8px rgba(201, 168, 76, 0.6))"
                  : "drop-shadow(0 0 0px rgba(201, 168, 76, 0))",
            }}
            whileTap={!submitted ? { scale: 0.9 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="cursor-pointer disabled:cursor-default p-2 focus:outline-none"
            aria-label={`${star} Stern${star > 1 ? "e" : ""}`}
          >
            <StarIcon filled={star <= (hover || rating)} />
          </motion.button>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <p className="font-serif text-2xl text-gold italic">Merci!</p>
            <p className="text-muted text-sm mt-2">
              Deine Bewertung: {rating} von 5 Sternen
            </p>
            <div className="flex gap-4 mt-6 text-sm">
              <a
                href="/stats"
                className="text-gold hover:text-gold-dark underline underline-offset-4 transition-colors"
              >
                Statistik ansehen
              </a>
              <a
                href="/woche"
                className="text-gold hover:text-gold-dark underline underline-offset-4 transition-colors"
              >
                Wochenplan
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
    </div>
  );
}

export function StaticStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={sizeClass}
          fill={star <= Math.round(rating) ? "#C9A84C" : "none"}
          stroke="#C9A84C"
          strokeWidth={1.5}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
