import { getAllDishStats } from "@/lib/actions/ratings";
import { StaticStars } from "@/components/star-rating";
import { formatDateShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getAllDishStats();

  return (
    <div className="py-12">
      <p className="text-muted text-xs uppercase tracking-[0.2em] text-center mb-2">
        Gesamtstatistik
      </p>
      <h1 className="font-serif text-3xl text-center mb-10">Alle Gerichte</h1>

      {stats.length === 0 ? (
        <p className="text-muted text-center text-sm">
          Noch keine Bewertungen vorhanden.
        </p>
      ) : (
        <div className="space-y-3">
          {stats.map((dish, index) => (
            <div
              key={dish.id}
              className="bg-white rounded-2xl p-5 flex items-start gap-4"
            >
              <span className="font-serif text-2xl text-gold/40 w-8 shrink-0 text-right">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-lg">{dish.name}</p>
                    <p className="text-muted text-xs mt-0.5">
                      {formatDateShort(dish.date)}
                    </p>
                  </div>
                  {dish.imageUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StaticStars rating={dish.average} />
                  <span className="text-muted text-xs">
                    {dish.average.toFixed(1)} ({dish.total}{" "}
                    {dish.total === 1 ? "Bewertung" : "Bewertungen"})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-10 text-sm">
        <a
          href="/"
          className="text-gold hover:text-gold-dark underline underline-offset-4 transition-colors"
        >
          Heute bewerten
        </a>
        <a
          href="/woche"
          className="text-gold hover:text-gold-dark underline underline-offset-4 transition-colors"
        >
          Wochenplan
        </a>
      </div>
    </div>
  );
}
