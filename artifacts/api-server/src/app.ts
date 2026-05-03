import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import ConnectPgSimple from "connect-pg-simple";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

const _primaryDomain =
  (process.env.REPLIT_DOMAINS || "").split(",")[0]?.trim() ||
  process.env.REPLIT_DEV_DOMAIN ||
  "localhost:5173";
const CLIENT_URL = process.env.CLIENT_URL || `https://${_primaryDomain}`;
const SESSION_SECRET = process.env.SESSION_SECRET || "devpulse-secret-change-me";
const isProduction = process.env.NODE_ENV === "production";
const DATABASE_URL = process.env.DATABASE_URL || "";

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server) and known origins
      if (!origin) return callback(null, true);
      const allowed = [CLIENT_URL, "https://dev-pulse--udaydolas08.replit.app"];
      if (allowed.some((o) => origin.startsWith(o.replace(/\/$/, "")))) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev; tighten in prod if needed
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL session store — survives autoscale restarts & multiple instances
const PgStore = ConnectPgSimple(session);
app.use(
  session({
    store: new PgStore({
      conString: DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use("/api", router);

export default app;
