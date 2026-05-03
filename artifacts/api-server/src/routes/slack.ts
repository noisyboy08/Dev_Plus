import { Router, type IRouter } from "express";
import { TestSlackWebhookBody, TestSlackWebhookResponse } from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

router.post("/slack/test", requireAuth, async (req, res): Promise<void> => {
  const body = TestSlackWebhookBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const slackRes = await fetch(body.data.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "✅ *DevPulse* — Slack integration test successful! You'll receive standups here.",
      }),
    });

    if (!slackRes.ok) {
      res.status(400).json({ error: "Webhook URL is invalid or Slack returned an error" });
      return;
    }

    res.json(TestSlackWebhookResponse.parse({ message: "Test message sent to Slack!" }));
  } catch (err) {
    logger.error({ err }, "Slack test failed");
    res.status(500).json({ error: "Failed to reach Slack webhook" });
  }
});

export default router;
