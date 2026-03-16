import { getWeekDishes } from "@/lib/actions/dishes";
import { getDishStats } from "@/lib/actions/ratings";
import { StaticStars } from "@/components/star-rating";
import { formatDateShort, getTodayDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WochePage() {
  const { dishes, dates } = await getWeekDishes();
  const today = getTodayDate();

  // Get stats for past dishes
  const statsMap: Record<string, { average: number; total: number }> = {};
  for (const date of dates) {
    if (date <= today && dishes[date]) {
      statsMap[date] = await getDishStats(dishes[date].id);
    }
  }

  return (
    <div className="py-12">
      <p className="text-muted text-xs uppercase tracking-[0.2em] text-center mb-2">
        Speiseplan
      </p>
      <h1 className="font-serif text-3xl text-center mb-10">Diese Woche</h1>

      <div className="space-y-4">
        {dates.map((date) => {
          const dish = dishes[date];
          const isToday = date === today;
          const isPast = date < today;
          const stats = statsMap[date];

          return (
            <div
              key={date}
              className={`rounded-2xl p-5 transition-all ${
                isToday
                  ? "bg-white shadow-md ring-1 ring-gold/20"
                  : "bg-white/60"
              }`}
            >
              <div className="flex items-start gap-4">
                {dish?.imageUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs uppercase tracking-[0.15em] mb-1 ${
                      isToday ? "text-gold font-medium" : "text-muted"
                    }`}
                  >
                    {formatDateShort(date)}
                    {isToday && " — Heute"}
                  </p>
                  {dish ? (
                    <>
                      <p className="font-serif text-lg">{dish.name}</p>
                      {dish.description && (
                        <p className="text-muted text-xs mt-1 line-clamp-2">
                          {dish.description}
                        </p>
                      )}
                      {isPast && stats && stats.total > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <StaticStars rating={stats.average} />
                          <span className="text-muted text-xs">
                            {stats.average.toFixed(1)} ({stats.total})
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted text-sm italic">
                      Noch kein Gericht geplant
                    </p>
                  )}
                </div>
                {isToday && dish && (
                  <a
                    href="/"
                    className="text-xs text-gold hover:text-gold-dark underline underline-offset-4 shrink-0"
                  >
                    Bewerten
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <a
          href="/stats"
          className="text-gold hover:text-gold-dark underline underline-offset-4 text-sm transition-colors"
        >
          Gesamtstatistik
        </a>
      </div>
    </div>
  );
}
