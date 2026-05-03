import { Router, type IRouter, type Request } from "express";
import { eq, desc } from "drizzle-orm";
import { db, standupsTable, usersTable } from "@workspace/db";
import type { usersTable as usersTableType } from "@workspace/db";
import {
  GetInsightsStreakResponse,
  GetInsightsBestDayResponse,
  GetInsightsPrCycleTimeQueryParams,
  GetInsightsPrCycleTimeResponse,
  GetInsightsTopKeywordsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

type AuthedRequest = Request & { sessionUser: typeof usersTableType.$inferSelect };

const router: IRouter = Router();

router.get("/insights/streak", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthedRequest).sessionUser;
  try {
    const standups = await db
      .select({ date: standupsTable.date })
      .from(standupsTable)
      .where(eq(standupsTable.userId, user.id))
      .orderBy(desc(standupsTable.date));

    const uniqueDates = [...new Set(standups.map((s) => s.date))].sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    const today = new Date().toISOString().slice(0, 10);
    let checkDate = today;

    for (const date of uniqueDates) {
      if (date === checkDate) {
        streak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().slice(0, 10);
      } else {
        break;
      }
    }
    currentStreak = streak;

    let runningStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else {
        runningStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak, uniqueDates.length > 0 ? 1 : 0);

    res.json(GetInsightsStreakResponse.parse({ currentStreak, longestStreak }));
  } catch (err) {
    logger.error({ err }, "Failed to compute streak");
    res.status(500).json({ error: "Failed to compute streak" });
  }
});

router.get("/insights/best-day", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthedRequest).sessionUser;
  try {
    const standups = await db
      .select({ date: standupsTable.date, velocityScore: standupsTable.velocityScore })
      .from(standupsTable)
      .where(eq(standupsTable.userId, user.id));

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayMap: Record<string, { total: number; count: number }> = {};
    for (const name of dayNames) {
      dayMap[name] = { total: 0, count: 0 };
    }

    for (const s of standups) {
      const dayName = dayNames[new Date(s.date).getDay()];
      dayMap[dayName].total += s.velocityScore || 5;
      dayMap[dayName].count++;
    }

    const result = dayNames
      .filter((d) => d !== "Sun" && d !== "Sat")
      .map((day) => ({
        day,
        avgVelocity:
          dayMap[day].count > 0
            ? Math.round((dayMap[day].total / dayMap[day].count) * 10) / 10
            : 0,
        count: dayMap[day].count,
      }));

    res.json(GetInsightsBestDayResponse.parse(result));
  } catch (err) {
    logger.error({ err }, "Failed to compute best day");
    res.status(500).json({ error: "Failed to compute best day" });
  }
});

router.get("/insights/pr-cycle-time", requireAuth, async (req, res): Promise<void> => {
  const params = GetInsightsPrCycleTimeQueryParams.safeParse(req.query);
  const user = (req as AuthedRequest).sessionUser;

  const repo = params.success ? params.data.repo : undefined;

  if (!repo) {
    res.json(
      GetInsightsPrCycleTimeResponse.parse({ avgHours: 0, label: "No repo selected", color: "gray" })
    );
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/pulls?state=closed&sort=updated&per_page=10`,
      {
        headers: {
          Authorization: `token ${user.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "DevPulse-App",
        },
      }
    );

    if (!response.ok) {
      res.json(
        GetInsightsPrCycleTimeResponse.parse({ avgHours: 0, label: "Unable to fetch", color: "gray" })
      );
      return;
    }

    const prs = (await response.json()) as Array<Record<string, unknown>>;
    const merged = prs.filter((p) => p.merged_at);

    if (merged.length === 0) {
      res.json(
        GetInsightsPrCycleTimeResponse.parse({ avgHours: 0, label: "No merged PRs", color: "gray" })
      );
      return;
    }

    const totalHours = merged.reduce((acc, pr) => {
      const created = new Date(pr.created_at as string).getTime();
      const mergedAt = new Date(pr.merged_at as string).getTime();
      return acc + (mergedAt - created) / (1000 * 60 * 60);
    }, 0);

    const avgHours = Math.round(totalHours / merged.length);
    let label: string;
    let color: string;

    if (avgHours < 24) {
      label = `${avgHours}h avg`;
      color = "green";
    } else if (avgHours < 72) {
      label = `${Math.round(avgHours / 24)}d avg`;
      color = "yellow";
    } else {
      label = `${Math.round(avgHours / 24)}d avg`;
      color = "red";
    }

    res.json(GetInsightsPrCycleTimeResponse.parse({ avgHours, label, color }));
  } catch (err) {
    logger.error({ err }, "Failed to compute PR cycle time");
    res.status(500).json({ error: "Failed to compute PR cycle time" });
  }
});

router.get("/insights/top-keywords", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthedRequest).sessionUser;
  try {
    const standups = await db
      .select({ rawActivity: standupsTable.rawActivity })
      .from(standupsTable)
      .where(eq(standupsTable.userId, user.id))
      .orderBy(desc(standupsTable.createdAt))
      .limit(30);

    const stopWords = new Set([
      "fix", "the", "a", "add", "update", "and", "or", "in", "of", "to", "for",
      "is", "with", "on", "at", "by", "an", "be", "it", "as", "this", "that",
      "from", "are", "was", "not", "but", "have", "had", "has", "will", "can",
      "use", "get", "set", "new", "old", "via", "feat", "chore", "docs", "refactor",
      "test", "merge", "bump", "remove", "delete", "create", "change", "clean",
    ]);

    const wordCounts: Record<string, number> = {};

    for (const s of standups) {
      if (!s.rawActivity) continue;
      try {
        const activity = JSON.parse(s.rawActivity) as { commits?: Array<{ message: string }> };
        for (const commit of activity.commits || []) {
          const words = commit.message
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length > 3 && !stopWords.has(w));
          for (const word of words) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }
        }
      } catch {
        continue;
      }
    }

    const keywords = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    res.json(GetInsightsTopKeywordsResponse.parse(keywords));
  } catch (err) {
    logger.error({ err }, "Failed to compute top keywords");
    res.status(500).json({ error: "Failed to compute top keywords" });
  }
});

// suppress unused import warning
void usersTable;

export default router;
