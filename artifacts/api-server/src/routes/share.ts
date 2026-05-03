import { Router, type IRouter, type Request } from "express";
import { eq, and } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, standupsTable } from "@workspace/db";
import { GenerateLinkedinPostBody, GenerateLinkedinPostResponse } from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";
import type { usersTable } from "@workspace/db";

type AuthedRequest = Request & { sessionUser: typeof usersTable.$inferSelect };

const router: IRouter = Router();

router.post("/share/linkedin-post", requireAuth, async (req, res): Promise<void> => {
  const body = GenerateLinkedinPostBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const user = (req as AuthedRequest).sessionUser;

  const [standup] = await db
    .select()
    .from(standupsTable)
    .where(and(eq(standupsTable.id, body.data.standupId), eq(standupsTable.userId, user.id)))
    .limit(1);

  if (!standup) {
    res.status(404).json({ error: "Standup not found" });
    return;
  }

  const blockers = JSON.parse(standup.blockers) as string[];

  const prompt = `Convert this developer standup into a short, engaging LinkedIn post (max 150 words). Make it sound proud but not boastful. Add 3 relevant hashtags at the end. Focus on impact and what was shipped.

Standup date: ${standup.date}
Repository: ${standup.repoName}
Yesterday: ${standup.yesterday}
Today: ${standup.today}
Blockers: ${blockers.length > 0 ? blockers.join(", ") : "None"}
Velocity score: ${standup.velocityScore}/10

Generate ONLY the LinkedIn post text, no explanation.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: "You write engaging LinkedIn posts for software developers. Be authentic, specific, and inspiring. Focus on what was built and the impact.",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    res.json(GenerateLinkedinPostResponse.parse({ post: content.text }));
  } catch (err) {
    logger.error({ err }, "LinkedIn post generation failed");
    res.status(500).json({ error: "Failed to generate LinkedIn post" });
  }
});

export default router;
