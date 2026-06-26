import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Database queries will fail.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy" });
export const db = drizzle(pool, { schema });

export * from "./schema";
