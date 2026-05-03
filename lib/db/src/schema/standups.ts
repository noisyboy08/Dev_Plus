import { pgTable, serial, integer, text, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const standupsTable = pgTable("standups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  repoName: text("repo_name").notNull(),
  date: date("date").notNull(),
  yesterday: text("yesterday").notNull(),
  today: text("today").notNull(),
  blockers: text("blockers").notNull().default("[]"),
  nextPriorityTask: text("next_priority_task"),
  velocityScore: integer("velocity_score"),
  rawActivity: text("raw_activity"),
  sentToSlack: boolean("sent_to_slack").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStandupSchema = createInsertSchema(standupsTable).omit({ id: true, createdAt: true });
export type InsertStandup = z.infer<typeof insertStandupSchema>;
export type Standup = typeof standupsTable.$inferSelect;
