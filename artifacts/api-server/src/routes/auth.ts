import { Router, type IRouter } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { db, usersTable, preferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetAuthMeResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger.js";

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

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      async (
        accessToken: string,
        _refreshToken: string,
        profile: { id: string; username: string; photos?: Array<{ value: string }> },
        done: (err: unknown, user?: unknown) => void
      ) => {
        try {
          const existing = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.githubId, profile.id))
            .limit(1);

          let user;
          if (existing.length > 0) {
            const [updated] = await db
              .update(usersTable)
              .set({
                username: profile.username,
                avatarUrl: profile.photos?.[0]?.value || null,
                accessToken,
              })
              .where(eq(usersTable.githubId, profile.id))
              .returning();
            user = updated;
          } else {
            const [created] = await db
              .insert(usersTable)
              .values({
                githubId: profile.id,
                username: profile.username,
                avatarUrl: profile.photos?.[0]?.value || null,
                accessToken,
              })
              .returning();
            user = created;

            await db.insert(preferencesTable).values({
              userId: user.id,
              standupTone: "professional",
            });
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
} else {
  logger.warn("GitHub OAuth credentials not configured. GitHub login will be unavailable.");
}

passport.serializeUser((user: unknown, done) => {
  const u = user as { id: number };
  done(null, u.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    done(null, user || null);
  } catch (err) {
    done(err);
  }
});

router.get("/auth/github", (req, res, next) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    res.status(503).json({ error: "GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET." });
    return;
  }
  passport.authenticate("github", { scope: ["user", "repo", "read:org"] })(req, res, next);
});

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: `${CLIENT_URL}?error=auth_failed` }),
  (_req, res): void => {
    res.redirect(CLIENT_URL);
  }
);

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = req.user as {
    id: number;
    githubId: string;
    username: string;
    avatarUrl: string | null;
    createdAt: Date;
  };
  res.json(
    GetAuthMeResponse.parse({
      id: user.id,
      githubId: user.githubId,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    })
  );
});

router.post("/auth/logout", (req, res): void => {
  req.logout((err) => {
    if (err) {
      logger.error({ err }, "Logout error");
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.json({ message: "Logged out successfully" });
  });
});

export { passport };
export default router;
