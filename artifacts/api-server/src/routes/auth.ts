import { Router, type IRouter } from "express";
import { db, usersTable, preferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetAuthMeResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger.js";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const router: IRouter = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const _primaryDomain =
  (process.env.REPLIT_DOMAINS || "").split(",")[0]?.trim() ||
  process.env.REPLIT_DEV_DOMAIN ||
  "localhost:8080";
const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL ||
  `https://${_primaryDomain}/api/auth/github/callback`;
const CLIENT_URL =
  process.env.CLIENT_URL || `https://${_primaryDomain}`;

logger.info(
  { GITHUB_CALLBACK_URL, CLIENT_URL, clientIdPrefix: GITHUB_CLIENT_ID.slice(0, 6) },
  "GitHub OAuth config"
);

// ── Step 1: Redirect to GitHub (no state — stateless for autoscale compatibility) ──
router.get("/auth/github", (req, res): void => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    res.status(503).json({
      error: "GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
    });
    return;
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: "user repo read:org",
  });

  logger.info({ redirectUri: GITHUB_CALLBACK_URL }, "Redirecting to GitHub");
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// ── Step 2: GitHub callback — exchange code, upsert user, set session ────────
router.get("/auth/github/callback", async (req, res): Promise<void> => {
  const { code, error: ghError } = req.query as Record<string, string>;

  if (ghError) {
    logger.error({ ghError }, "GitHub returned error on callback");
    res.redirect(`${CLIENT_URL}?error=${encodeURIComponent(ghError)}`);
    return;
  }

  if (!code) {
    logger.error("No code received from GitHub");
    res.redirect(`${CLIENT_URL}?error=no_code`);
    return;
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData = (await tokenRes.json()) as Record<string, string>;
    logger.info(
      { tokenStatus: tokenRes.status, tokenError: tokenData.error, tokenErrorDesc: tokenData.error_description },
      "GitHub token exchange response"
    );

    if (tokenData.error || !tokenData.access_token) {
      logger.error({ tokenData }, "GitHub token exchange failed");
      res.redirect(`${CLIENT_URL}?error=${encodeURIComponent(tokenData.error || "no_token")}`);
      return;
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub user profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!profileRes.ok) {
      logger.error({ status: profileRes.status }, "Failed to fetch GitHub user profile");
      res.redirect(`${CLIENT_URL}?error=profile_fetch_failed`);
      return;
    }

    const profile = (await profileRes.json()) as {
      id: number;
      login: string;
      avatar_url?: string;
    };
    logger.info({ githubUsername: profile.login }, "GitHub profile fetched");

    // Upsert user in DB
    const githubId = String(profile.id);
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.githubId, githubId))
      .limit(1);

    let user;
    if (existing.length > 0) {
      const [updated] = await db
        .update(usersTable)
        .set({ username: profile.login, avatarUrl: profile.avatar_url || null, accessToken })
        .where(eq(usersTable.githubId, githubId))
        .returning();
      user = updated;
    } else {
      const [created] = await db
        .insert(usersTable)
        .values({
          githubId,
          username: profile.login,
          avatarUrl: profile.avatar_url || null,
          accessToken,
        })
        .returning();
      user = created;
      await db.insert(preferencesTable).values({ userId: user.id, standupTone: "professional" });
    }

    // Save userId to session
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        logger.error({ err }, "Failed to save userId to session");
        res.redirect(`${CLIENT_URL}?error=session_failed`);
        return;
      }
      logger.info({ userId: user.id, username: user.username }, "User logged in successfully");
      res.redirect(`${CLIENT_URL}/dashboard`);
    });
  } catch (err) {
    logger.error({ err }, "Unexpected OAuth callback error");
    res.redirect(`${CLIENT_URL}?error=oauth_failed`);
  }
});

// ── /auth/me ─────────────────────────────────────────────────────────────────
router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json(
      GetAuthMeResponse.parse({
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      })
    );
  } catch (err) {
    logger.error({ err }, "Error fetching user");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── /auth/logout ──────────────────────────────────────────────────────────────
router.post("/auth/logout", (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Logout error");
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
