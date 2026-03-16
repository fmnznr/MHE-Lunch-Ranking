import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const dishes = sqliteTable("dishes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const ratings = sqliteTable("ratings", {
  id: text("id").primaryKey(),
  dishId: text("dish_id")
    .notNull()
    .references(() => dishes.id),
  stars: integer("stars").notNull(),
  cookieToken: text("cookie_token").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
