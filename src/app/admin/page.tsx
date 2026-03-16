import { isAdminAuthenticated } from "@/lib/actions/admin";
import { getWeekDishes } from "@/lib/actions/dishes";
import { getDishStats } from "@/lib/actions/ratings";
import { redirect } from "next/navigation";
import { formatDateShort } from "@/lib/utils";
import { AdminDishForm } from "@/components/admin-dish-form";
import { StaticStars } from "@/components/star-rating";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  const { dishes, dates } = await getWeekDishes();

  const statsMap: Record<string, { average: number; total: number }> = {};
  for (const date of dates) {
    if (dishes[date]) {
      statsMap[date] = await getDishStats(dishes[date].id);
    }
  }

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-muted text-xs uppercase tracking-[0.2em] mb-1">
            Admin
          </p>
          <h1 className="font-serif text-3xl">Wochenplan</h1>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="text-xs text-muted hover:text-charcoal underline underline-offset-4 transition-colors"
          >
            Abmelden
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {dates.map((date) => {
          const dish = dishes[date];
          const stats = statsMap[date];

          return (
            <div key={date} className="bg-white rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
                {formatDateShort(date)}
              </p>

              {dish ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {dish.imageUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-serif text-lg">{dish.name}</p>
                      {dish.description && (
                        <p className="text-muted text-xs mt-1">
                          {dish.description}
                        </p>
                      )}
                      {stats && stats.total > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <StaticStars rating={stats.average} size="sm" />
                          <span className="text-muted text-xs">
                            {stats.average.toFixed(1)} ({stats.total})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <AdminDishForm date={date} existingDish={dish} />
                </div>
              ) : (
                <AdminDishForm date={date} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
