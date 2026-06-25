import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// 手动加载 .env.local（drizzle-kit 不自动读取 Next.js 环境变量）
config({ path: resolve(__dirname, ".env.local") });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
