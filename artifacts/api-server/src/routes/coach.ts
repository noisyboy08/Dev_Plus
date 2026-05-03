import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { CoachChatBody, CoachChatResponse } from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { getActivity } from "../lib/github.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

router.post("/coach/chat", requireAuth, async (req, res): Promise<void> => {
  const body = CoachChatBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const user = req.user as { id: number; accessToken: string; username: string };

  let activityContext = "No recent GitHub activity available.";

  if (body.data.repo) {
    try {
      const activity = await getActivity(user.accessToken, body.data.repo);
      const commitList = activity.commits.length > 0
        ? activity.commits.map((c) => `- [${c.sha}] ${c.message}`).join("\n")
        : "No commits in last 24h";
      const prList = activity.prs.length > 0
        ? activity.prs.map((p) => `- PR #${p.number}: ${p.title} [${p.state}]`).join("\n")
        : "No recent PRs";
      activityContext = `Recent commits:\n${commitList}\n\nPull Requests:\n${prList}`;
    } catch {
      activityContext = "Could not fetch GitHub activity.";
    }
  }

  const history = (body.data.conversationHistory || []).slice(-10).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...history,
    { role: "user", content: body.data.message },
  ];

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: `You are DevPulse AI Coach — a senior engineering mentor with full context of this developer's recent GitHub activity:

${activityContext}

Developer GitHub username: ${user.username}

Answer questions about their code, productivity, sprint progress, and career. Be direct, specific, and encouraging. Keep responses under 150 words unless asked for more detail. Be concise and actionable.`,
      messages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    res.json(CoachChatResponse.parse({ reply: content.text }));
  } catch (err) {
    logger.error({ err }, "Coach chat failed");
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
