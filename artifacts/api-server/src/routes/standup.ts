import { Router, type IRouter, type Request } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, standupsTable, preferencesTable, usersTable } from "@workspace/db";
import type { usersTable as usersTableType } from "@workspace/db";
import {
  GenerateStandupBody,
  GenerateStandupResponse,
  GetStandupHistoryResponse,
  GetStandupParams,
  GetStandupResponse,
  SendStandupToSlackParams,
  SendStandupToSlackResponse,
  GetPublicStandupParams,
  GetPublicStandupResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { getActivity } from "../lib/github.js";
import { generateStandup } from "../lib/claude.js";
import { logger } from "../lib/logger.js";

type AuthedRequest = Request & { sessionUser: typeof usersTableType.$inferSelect };

const router: IRouter = Router();

function serializeStandup(s: typeof standupsTable.$inferSelect) {
  return {
    id: s.id,
    userId: s.userId,
    repoName: s.repoName,
    date: s.date,
    yesterday: s.yesterday,
    today: s.today,
    blockers: JSON.parse(s.blockers) as string[],
    nextPriorityTask: s.nextPriorityTask,
    velocityScore: s.velocityScore,
    sentToSlack: s.sentToSlack,
    createdAt: s.createdAt.toISOString(),
  };
}

router.post("/standup/generate", requireAuth, async (req, res): Promise<void> => {
  const body = GenerateStandupBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const user = (req as AuthedRequest).sessionUser;

  try {
    const [prefs] = await db
      .select()
      .from(preferencesTable)
      .where(eq(preferencesTable.userId, user.id))
      .limit(1);

    const tone = prefs?.standupTone || "professional";

    const activity = await getActivity(
      user.accessToken!,
      body.data.repoName,
      body.data.since
    );

    const result = await generateStandup(activity, tone);

    const today = new Date().toISOString().slice(0, 10);

    const [standup] = await db
      .insert(standupsTable)
      .values({
        userId: user.id,
        repoName: body.data.repoName,
        date: today,
        yesterday: result.yesterday,
        today: result.today,
        blockers: JSON.stringify(result.blockers),
        nextPriorityTask: result.nextPriorityTask,
        velocityScore: result.velocityScore,
        rawActivity: JSON.stringify(activity),
        sentToSlack: false,
      })
      .returning();

    const userStandups = await db
      .select()
      .from(standupsTable)
      .where(eq(standupsTable.userId, user.id))
      .orderBy(desc(standupsTable.createdAt));

    if (userStandups.length > 30) {
      const toDelete = userStandups.slice(30).map((s) => s.id);
      for (const id of toDelete) {
        await db
          .delete(standupsTable)
          .where(and(eq(standupsTable.id, id), eq(standupsTable.userId, user.id)));
      }
    }

    res.json(GenerateStandupResponse.parse(serializeStandup(standup)));
  } catch (err) {
    logger.error({ err }, "Failed to generate standup");
    res.status(500).json({ error: "Failed to generate standup" });
  }
});

router.get("/standup/history", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthedRequest).sessionUser;
  try {
    const standups = await db
      .select()
      .from(standupsTable)
      .where(eq(standupsTable.userId, user.id))
      .orderBy(desc(standupsTable.createdAt));

    res.json(GetStandupHistoryResponse.parse(standups.map(serializeStandup)));
  } catch (err) {
    logger.error({ err }, "Failed to fetch history");
    res.status(500).json({ error: "Failed to fetch standup history" });
  }
});

router.get("/standup/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetStandupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const user = (req as AuthedRequest).sessionUser;
  const [standup] = await db
    .select()
    .from(standupsTable)
    .where(and(eq(standupsTable.id, params.data.id), eq(standupsTable.userId, user.id)))
    .limit(1);

  if (!standup) {
    res.status(404).json({ error: "Standup not found" });
    return;
  }

  res.json(GetStandupResponse.parse(serializeStandup(standup)));
});

router.get("/standup/:id/public", async (req, res): Promise<void> => {
  const params = GetPublicStandupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [standup] = await db
    .select()
    .from(standupsTable)
    .where(eq(standupsTable.id, params.data.id))
    .limit(1);

  if (!standup) {
    res.status(404).json({ error: "Standup not found" });
    return;
  }

  const [user] = await db
    .select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
    .from(usersTable)
    .where(eq(usersTable.id, standup.userId))
    .limit(1);

  const publicData = {
    id: standup.id,
    repoName: standup.repoName,
    date: standup.date,
    yesterday: standup.yesterday,
    today: standup.today,
    blockers: JSON.parse(standup.blockers) as string[],
    nextPriorityTask: standup.nextPriorityTask,
    velocityScore: standup.velocityScore,
    createdAt: standup.createdAt.toISOString(),
    author: {
      username: user?.username || "Unknown",
      avatarUrl: user?.avatarUrl || null,
    },
  };

  res.json(GetPublicStandupResponse.parse(publicData));
});

router.post("/standup/:id/send-slack", requireAuth, async (req, res): Promise<void> => {
  const params = SendStandupToSlackParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const user = (req as AuthedRequest).sessionUser;

  const [prefs] = await db
    .select()
    .from(preferencesTable)
    .where(eq(preferencesTable.userId, user.id))
    .limit(1);

  if (!prefs?.slackWebhookUrl) {
    res.status(400).json({ error: "No Slack webhook URL configured. Add one in Settings." });
    return;
  }

  const [standup] = await db
    .select()
    .from(standupsTable)
    .where(and(eq(standupsTable.id, params.data.id), eq(standupsTable.userId, user.id)))
    .limit(1);

  if (!standup) {
    res.status(404).json({ error: "Standup not found" });
    return;
  }

  const blockers = JSON.parse(standup.blockers) as string[];
  const blockersText = blockers.length > 0 ? blockers.join(", ") : "None";

  const slackBody = {
    text: `📋 *DevPulse Standup — ${standup.date}*\n\n*Yesterday:* ${standup.yesterday}\n*Today:* ${standup.today}\n*Blockers:* ${blockersText}`,
  };

  try {
    const slackRes = await fetch(prefs.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackBody),
    });

    if (!slackRes.ok) {
      res.status(500).json({ error: "Failed to send to Slack" });
      return;
    }

    await db
      .update(standupsTable)
      .set({ sentToSlack: true })
      .where(eq(standupsTable.id, params.data.id));

    res.json(SendStandupToSlackResponse.parse({ message: "Sent to Slack successfully" }));
  } catch (err) {
    logger.error({ err }, "Slack send failed");
    res.status(500).json({ error: "Failed to send to Slack" });
  }
});

export default router;
