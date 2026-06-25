/**
 * 数据库迁移脚本 — 将 SQL 推送到 Supabase 云数据库
 * 用法：npx tsx scripts/migrate.ts
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

// 加载 .env.local
config({ path: resolve(__dirname, "..", ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL 未设置！请在 .env.local 中配置。");
  process.exit(1);
}

// 此时 DATABASE_URL 已确保非空
const DB_URL: string = DATABASE_URL;

async function migrate() {
  console.log("🔗 连接 Supabase 云数据库...");
  const sql = postgres(DB_URL, { max: 1 });

  try {
    // 读取迁移 SQL 文件
    const migrationPath = resolve(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "0001_init.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 读取迁移文件: supabase/migrations/0001_init.sql");
    console.log(`   文件大小: ${migrationSQL.length} 字符`);

    // 执行 SQL（postgres.js 支持多语句）
    console.log("🚀 正在执行建表语句...");
    await sql.unsafe(migrationSQL);

    console.log("✅ 迁移完成！正在验证...");

    // 验证：检查四张表是否存在
    const tables = await sql<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'vaults', 'credentials', 'access_logs')
      ORDER BY table_name;
    `;

    console.log("\n📊 云数据库表清单：");
    for (const t of tables) {
      console.log(`   ✅ public.${t.table_name}`);
    }

    if (tables.length === 4) {
      console.log("\n🎉 全部四张表已成功推送到 Supabase 新加坡云数据库！");
    } else {
      console.log(
        `\n⚠️  预期 4 张表，实际找到 ${tables.length} 张，请检查。`
      );
    }
  } catch (error) {
    console.error("❌ 迁移失败:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
