import postgres from "postgres";
import { readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const migrationFile = process.argv[2] || "supabase/migrations/0002_auth.sql";
const sql = readFileSync(migrationFile, "utf-8");
console.log(`Running: ${migrationFile}`);

const client = postgres(url, { max: 1, ssl: "require" });

try {
  await client.unsafe(sql);
  console.log("✅ Migration 0002_auth applied successfully");
} catch (err) {
  console.error("Migration error:", err.message);
} finally {
  await client.end();
}
