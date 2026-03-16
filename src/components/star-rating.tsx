"use client";

import { useState, useCallback } from "react";
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

const REACTIONS: Record<number, { text: string; size: string }> = {
  1: { text: "Schade...", size: "text-xl" },
  2: { text: "Geht so", size: "text-xl" },
  3: { text: "Solide! 👍", size: "text-2xl" },
  4: { text: "Très bien! ✨", size: "text-2xl" },
  5: { text: "Magnifique! 🌟", size: "text-3xl" },
};

function triggerHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(15);
  }
}

export function StarRating({ dishId, initialRating, disabled }: StarRatingProps) {
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [submitted, setSubmitted] = useState(!!initialRating);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cascadeTarget, setCascadeTarget] = useState<number>(0);

  const handleClick = useCallback(async (stars: number) => {
    if (submitted || disabled || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setCascadeTarget(stars);

    // Trigger haptic for each star in cascade
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => triggerHaptic(), i * 80);
    }

    const result = await submitRating(dishId, stars);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      setCascadeTarget(0);
      return;
    }

    setRating(stars);
    setSubmitted(true);
    setShowConfetti(true);
    setIsSubmitting(false);
  }, [submitted, disabled, isSubmitting, dishId]);

  const reaction = REACTIONS[rating] ?? REACTIONS[3];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2 relative">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {/* Pulse ring on the clicked star */}
            <AnimatePresence>
              {cascadeTarget === star && submitted && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)",
                  }}
                />
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              disabled={submitted || disabled || isSubmitting}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !submitted && !isSubmitting && setHover(star)}
              onMouseLeave={() => !submitted && !isSubmitting && setHover(0)}
              animate={
                cascadeTarget > 0 && star <= cascadeTarget && submitted
                  ? {
                      scale: [1, 1.3, 1],
                      filter: "drop-shadow(0 0 8px rgba(201, 168, 76, 0.6))",
                    }
                  : {
                      scale: !submitted && star <= hover ? 1.15 : 1,
                      filter:
                        !submitted && star <= hover
                          ? "drop-shadow(0 0 8px rgba(201, 168, 76, 0.6))"
                          : "drop-shadow(0 0 0px rgba(201, 168, 76, 0))",
                    }
              }
              transition={
                cascadeTarget > 0 && star <= cascadeTarget && submitted
                  ? {
                      delay: (star - 1) * 0.08,
                      duration: 0.35,
                      ease: [0.34, 1.56, 0.64, 1],
                    }
                  : { type: "spring", stiffness: 400, damping: 15 }
              }
              whileTap={!submitted ? { scale: 0.9 } : {}}
              className="cursor-pointer disabled:cursor-default p-2 focus:outline-none relative z-10"
              aria-label={`${star} Stern${star > 1 ? "e" : ""}`}
            >
              <StarIcon
                filled={
                  cascadeTarget > 0
                    ? star <= cascadeTarget
                    : star <= (hover || rating)
                }
              />
            </motion.button>
          </div>
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
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 1.2 + (cascadeTarget * 0.08),
              duration: 0.5,
              scale: {
                type: "spring",
                stiffness: 300,
                damping: 12,
              },
            }}
            className="text-center"
          >
            <p className={`font-serif ${reaction.size} text-gold italic`}>
              {reaction.text}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 + (cascadeTarget * 0.08) }}
              className="text-muted text-sm mt-2"
            >
              Deine Bewertung: {rating} von 5 Sternen
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 + (cascadeTarget * 0.08) }}
              className="flex gap-4 mt-6 text-sm"
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfetti && (
        <Confetti
          intensity={rating}
          onComplete={() => setShowConfetti(false)}
        />
      )}
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
