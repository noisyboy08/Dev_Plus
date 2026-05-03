import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/debug-env", (_req, res) => {
  res.json({
    hasClientId: !!process.env.GITHUB_CLIENT_ID,
    clientIdPrefix: process.env.GITHUB_CLIENT_ID?.slice(0, 6) ?? null,
    hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    hasCallbackUrl: !!process.env.GITHUB_CALLBACK_URL,
    callbackUrl: process.env.GITHUB_CALLBACK_URL ?? null,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV ?? null,
    replitDomains: process.env.REPLIT_DOMAINS ?? null,
    sessionStore: "postgresql",
    passportRemoved: true,
  });
});

export default router;
