"use server";

import { db } from "@/lib/db";
import { ratings, dishes } from "@/lib/db/schema";
import { generateId, getTodayDate } from "@/lib/utils";
import { eq, and, avg, count, desc } from "drizzle-orm";
import { cookies } from "next/headers";

async function readCookieToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("rating_token")?.value ?? null;
}

async function getOrCreateCookieToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get("rating_token")?.value;
  if (!token) {
    token = crypto.randomUUID();
    cookieStore.set("rating_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
  }
  return token;
}

export async function submitRating(dishId: string, stars: number) {
  if (stars < 1 || stars > 5) {
    return { error: "Bewertung muss zwischen 1 und 5 sein" };
  }

  const token = await getOrCreateCookieToken();

  // Check if already rated
  const existing = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.dishId, dishId), eq(ratings.cookieToken, token)))
    .limit(1);

  if (existing.length > 0) {
    return { error: "Du hast dieses Gericht bereits bewertet" };
  }

  await db.insert(ratings).values({
    id: generateId(),
    dishId,
    stars,
    cookieToken: token,
  });

  return { success: true };
}

export async function hasUserRated(dishId: string): Promise<boolean> {
  const token = await readCookieToken();
  if (!token) return false;
  const existing = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.dishId, dishId), eq(ratings.cookieToken, token)))
    .limit(1);
  return existing.length > 0;
}

export async function getUserRating(dishId: string): Promise<number | null> {
  const token = await readCookieToken();
  if (!token) return null;
  const existing = await db
    .select({ stars: ratings.stars })
    .from(ratings)
    .where(and(eq(ratings.dishId, dishId), eq(ratings.cookieToken, token)))
    .limit(1);
  return existing.length > 0 ? existing[0].stars : null;
}

export async function getDishStats(dishId: string) {
  const result = await db
    .select({
      average: avg(ratings.stars),
      total: count(ratings.id),
    })
    .from(ratings)
    .where(eq(ratings.dishId, dishId));

  return {
    average: result[0]?.average ? parseFloat(result[0].average as string) : 0,
    total: result[0]?.total ?? 0,
  };
}

export async function getAllDishStats(limit?: number) {
  const result = await db
    .select({
      id: dishes.id,
      name: dishes.name,
      description: dishes.description,
      imageUrl: dishes.imageUrl,
      date: dishes.date,
      average: avg(ratings.stars),
      total: count(ratings.id),
    })
    .from(dishes)
    .leftJoin(ratings, eq(dishes.id, ratings.dishId))
    .groupBy(dishes.id)
    .orderBy(desc(avg(ratings.stars)))
    .limit(limit ?? 100);

  return result.map((r) => ({
    ...r,
    average: r.average ? parseFloat(r.average as string) : 0,
    total: r.total ?? 0,
  }));
}
