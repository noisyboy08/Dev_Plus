import { Router, type IRouter } from "express";
import {
  GetGithubActivityQueryParams,
  GetGithubVelocityQueryParams,
  GetGithubActivityResponse,
  GetGithubReposResponse,
  GetGithubVelocityResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { listRepos, getActivity, getVelocity } from "../lib/github.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

router.get("/github/repos", requireAuth, async (req, res): Promise<void> => {
  const user = req.user as { accessToken: string };
  try {
    const repos = await listRepos(user.accessToken);
    res.json(GetGithubReposResponse.parse(repos));
  } catch (err) {
    logger.error({ err }, "Failed to fetch repos");
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

router.get("/github/activity", requireAuth, async (req, res): Promise<void> => {
  const params = GetGithubActivityQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const user = req.user as { accessToken: string };
  try {
    const activity = await getActivity(user.accessToken, params.data.repo, params.data.since);
    res.json(GetGithubActivityResponse.parse(activity));
  } catch (err) {
    logger.error({ err }, "Failed to fetch activity");
    res.status(500).json({ error: "Failed to fetch GitHub activity" });
  }
});

router.get("/github/velocity", requireAuth, async (req, res): Promise<void> => {
  const params = GetGithubVelocityQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const user = req.user as { accessToken: string };
  try {
    const velocity = await getVelocity(user.accessToken, params.data.repo);
    res.json(GetGithubVelocityResponse.parse(velocity));
  } catch (err) {
    logger.error({ err }, "Failed to fetch velocity");
    res.status(500).json({ error: "Failed to fetch velocity data" });
  }
});

export default router;
