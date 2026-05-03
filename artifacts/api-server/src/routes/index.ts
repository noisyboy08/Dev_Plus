import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import githubRouter from "./github.js";
import standupRouter from "./standup.js";
import preferencesRouter from "./preferences.js";
import slackRouter from "./slack.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(githubRouter);
router.use(standupRouter);
router.use(preferencesRouter);
router.use(slackRouter);

export default router;
