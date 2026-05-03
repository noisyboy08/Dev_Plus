import { Router, type IRouter, type Request } from "express";
import { eq } from "drizzle-orm";
import { db, preferencesTable } from "@workspace/db";
import {
  UpdatePreferencesBody,
  GetPreferencesResponse,
  UpdatePreferencesResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";
import type { usersTable } from "@workspace/db";

type AuthedRequest = Request & { sessionUser: typeof usersTable.$inferSelect };

const router: IRouter = Router();

function serializePreferences(p: typeof preferencesTable.$inferSelect) {
  return {
    userId: p.userId,
    slackWebhookUrl: p.slackWebhookUrl,
    standupTone: p.standupTone as "professional" | "casual" | "bullet-points",
    defaultRepo: p.defaultRepo,
  };
}

router.get("/preferences", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthedRequest).sessionUser;
  try {
    const [prefs] = await db
      .select()
      .from(preferencesTable)
      .where(eq(preferencesTable.userId, user.id))
      .limit(1);

    if (!prefs) {
      const [created] = await db
        .insert(preferencesTable)
        .values({ userId: user.id, standupTone: "professional" })
        .returning();
      res.json(GetPreferencesResponse.parse(serializePreferences(created)));
      return;
    }

    res.json(GetPreferencesResponse.parse(serializePreferences(prefs)));
  } catch (err) {
    logger.error({ err }, "Failed to fetch preferences");
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

router.put("/preferences", requireAuth, async (req, res): Promise<void> => {
  const body = UpdatePreferencesBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const user = (req as AuthedRequest).sessionUser;
  try {
    const updateData: Partial<typeof preferencesTable.$inferSelect> = {};
    if (body.data.slackWebhookUrl !== undefined) updateData.slackWebhookUrl = body.data.slackWebhookUrl;
    if (body.data.standupTone !== undefined) updateData.standupTone = body.data.standupTone;
    if (body.data.defaultRepo !== undefined) updateData.defaultRepo = body.data.defaultRepo;

    const existing = await db
      .select()
      .from(preferencesTable)
      .where(eq(preferencesTable.userId, user.id))
      .limit(1);

    let prefs;
    if (existing.length === 0) {
      const [created] = await db
        .insert(preferencesTable)
        .values({ userId: user.id, standupTone: "professional", ...updateData })
        .returning();
      prefs = created;
    } else {
      const [updated] = await db
        .update(preferencesTable)
        .set(updateData)
        .where(eq(preferencesTable.userId, user.id))
        .returning();
      prefs = updated;
    }

    res.json(UpdatePreferencesResponse.parse(serializePreferences(prefs)));
  } catch (err) {
    logger.error({ err }, "Failed to update preferences");
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
