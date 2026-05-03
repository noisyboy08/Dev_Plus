import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const preferencesTable = pgTable("preferences", {
  userId: integer("user_id").primaryKey().references(() => usersTable.id),
  slackWebhookUrl: text("slack_webhook_url"),
  standupTone: text("standup_tone").notNull().default("professional"),
  defaultRepo: text("default_repo"),
});

export const insertPreferencesSchema = createInsertSchema(preferencesTable);
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type Preferences = typeof preferencesTable.$inferSelect;
