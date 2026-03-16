import { getTodaysDish } from "@/lib/actions/dishes";
import { getUserRating } from "@/lib/actions/ratings";
import { StarRating } from "@/components/star-rating";
import { formatDate, getTodayDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dish = await getTodaysDish();
  const today = getTodayDate();

  if (!dish) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center py-20">
        <p className="font-serif text-3xl text-charcoal mb-2">
          Heute kein Gericht
        </p>
        <p className="text-muted text-sm">{formatDate(today)}</p>
        <div className="mt-8 w-16 h-px bg-gold/30" />
        <div className="flex gap-4 mt-8 text-sm">
          <a
            href="/woche"
            className="text-gold hover:text-gold-dark underline underline-offset-4 transition-colors"
          >
            Wochenplan
          </a>
          <a
            href="/stats"
            className="text-gold hover:text-gold-dark underline underline-offset-4 transition-colors"
          >
            Statistik
          </a>
        </div>
      </div>
    );
  }

  const userRating = await getUserRating(dish.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <p className="text-muted text-xs uppercase tracking-[0.2em] mb-8">
        {formatDate(today)}
      </p>

      {dish.imageUrl && (
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 className="font-serif text-3xl sm:text-4xl text-center mb-3">
        {dish.name}
      </h1>

      {dish.description && (
        <p className="text-muted text-center text-sm leading-relaxed max-w-xs mb-10">
          {dish.description}
        </p>
      )}

      <div className="w-16 h-px bg-gold/30 mb-10" />

      {userRating ? (
        <div className="text-center">
          <p className="font-serif text-2xl text-gold italic mb-2">Merci!</p>
          <p className="text-muted text-sm">
            Deine Bewertung: {userRating} von 5 Sternen
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
        </div>
      ) : (
        <>
          <p className="text-muted text-xs uppercase tracking-[0.15em] mb-6">
            Wie war&apos;s?
          </p>
          <StarRating dishId={dish.id} />
        </>
      )}
    </div>
  );
}
