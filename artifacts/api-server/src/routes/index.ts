import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import githubRouter from "./github.js";
import standupRouter from "./standup.js";
import preferencesRouter from "./preferences.js";
import slackRouter from "./slack.js";
import coachRouter from "./coach.js";
import shareRouter from "./share.js";
import insightsRouter from "./insights.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(githubRouter);
router.use(standupRouter);
router.use(preferencesRouter);
router.use(slackRouter);
router.use(coachRouter);
router.use(shareRouter);
router.use(insightsRouter);

export default router;
