"use server";

import { db } from "@/lib/db";
import { dishes } from "@/lib/db/schema";
import { generateId, getTodayDate, getWeekDates } from "@/lib/utils";
import { eq, inArray } from "drizzle-orm";

export async function getTodaysDish() {
  const today = getTodayDate();
  const result = await db
    .select()
    .from(dishes)
    .where(eq(dishes.date, today))
    .limit(1);
  return result[0] ?? null;
}

export async function getWeekDishes() {
  const weekDates = getWeekDates();
  const result = await db
    .select()
    .from(dishes)
    .where(inArray(dishes.date, weekDates));

  // Return as map by date for easy lookup
  const dishMap: Record<string, typeof result[0]> = {};
  for (const dish of result) {
    dishMap[dish.date] = dish;
  }
  return { dishes: dishMap, dates: weekDates };
}

export async function createDish(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  date: string;
}) {
  const id = generateId();
  await db.insert(dishes).values({
    id,
    name: data.name,
    description: data.description ?? null,
    imageUrl: data.imageUrl ?? null,
    date: data.date,
  });
  return id;
}

export async function updateDish(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    imageUrl?: string;
    date?: string;
  }
) {
  await db
    .update(dishes)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.date !== undefined && { date: data.date }),
    })
    .where(eq(dishes.id, id));
}

export async function deleteDish(id: string) {
  await db.delete(dishes).where(eq(dishes.id, id));
}
