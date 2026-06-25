/**
 * Supabase + Drizzle ORM 数据库实例
 * Vercel Serverless 优化版 — 延迟连接
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

let _db: PostgresJsDatabase | null = null;

function getDb(): PostgresJsDatabase {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL 未配置");
  }

  const client = postgres(url, {
    max: 1,
    idle_timeout: 10,
    connect_timeout: 15,
    prepare: false,
    ssl: "require",
  });

  _db = drizzle(client);
  return _db;
}

// 代理对象：每次访问时动态获取 db 实例
export const db = new Proxy({} as PostgresJsDatabase, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

export * from "./schema";
