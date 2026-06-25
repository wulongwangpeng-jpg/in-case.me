/**
 * 「万一呢」v1.0 — Drizzle ORM Schema
 * 零知识加密 · 不存明文密码 · 纯时间戳比对
 *
 * 对应 SQL: supabase/migrations/0001_init.sql
 */

import {
  pgTable,
  uuid,
  varchar,
  smallint,
  integer,
  timestamp,
  text,
  inet,
  boolean,
  uniqueIndex,
  index,
  check,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// 枚举
// ============================================================

export const vaultTypeEnum = pgEnum("vault_type", [
  "asset_inventory",
  "farewell_letter",
  "wishlist",
]);

export const credentialStatusEnum = pgEnum("credential_status", [
  "active",
  "revoked",
  "delivered",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "user_renewal",
  "messenger_attempt",
  "blocked_still_active",
  "data_delivered",
  "credential_created",
  "credential_revoked",
  "credential_restored",
  // 死信通知 + 信使核验
  "messenger_notify_0h",
  "messenger_notify_24h",
  "messenger_notify_48h",
  "messenger_reply_safe",
  "messenger_reply_lost",
  "messenger_auto_deliver",
  // 信使接受 + 用户预警
  "credential_accepted",
  "user_warned_80pct",
  "user_warned_90pct",
  "threshold_updated",
]);

export const accessResultEnum = pgEnum("access_result", [
  "allowed",
  "denied",
]);

// ============================================================
// 1. users
// ============================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).unique(),
    nickname: varchar("nickname", { length: 64 }),
    lastActiveTime: timestamp("last_active_time", { withTimezone: true })
      .notNull()
      .defaultNow(),
    safeThresholdDays: smallint("safe_threshold_days")
      .notNull()
      .default(180),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_users_active").on(
      table.lastActiveTime,
      table.safeThresholdDays
    ),
    index("idx_users_phone").on(table.phone),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  vaults: many(vaults),
  credentials: many(credentials),
  accessLogs: many(accessLogs),
}));

// ============================================================
// 2. vaults — 密文保险库
// ============================================================

export const vaults = pgTable(
  "vaults",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // 类型
    vaultType: vaultTypeEnum("vault_type").notNull(),

    // 明文元数据（无敏感信息）
    aliasName: varchar("alias_name", { length: 128 }),
    memoryHint: varchar("memory_hint", { length: 256 }),
    categoryTag: varchar("category_tag", { length: 64 }),

    // 加密核心字段
    encryptedContent: text("encrypted_content").notNull(),
    encryptionSalt: varchar("encryption_salt", { length: 64 }).notNull(),
    encryptionIv: varchar("encryption_iv", { length: 32 }).notNull(),

    // 加密协议版本
    encryptionVersion: smallint("encryption_version").notNull().default(1),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_vaults_user").on(table.userId, table.vaultType),
    index("idx_vaults_category").on(table.userId, table.categoryTag),
  ]
);

export const vaultsRelations = relations(vaults, ({ one, many }) => ({
  user: one(users, {
    fields: [vaults.userId],
    references: [users.id],
  }),
  credentialVaults: many(credentialVaults),
}));

// ============================================================
// 3. credentials — 信使提取凭证
// ============================================================

export const credentials = pgTable(
  "credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // 信使信息
    messengerEmail: varchar("messenger_email", { length: 255 }),
    messengerPhone: varchar("messenger_phone", { length: 32 }),
    messengerPhone2: varchar("messenger_phone2", { length: 32 }),
    messengerRelation: varchar("messenger_relation", { length: 32 }),
    messengerLabel: varchar("messenger_label", { length: 64 }),

    // 双码机制
    humanCode: varchar("human_code", { length: 32 }).notNull(),
    accessToken: varchar("access_token", { length: 128 }).notNull(),

    // 状态
    status: credentialStatusEnum("status").notNull().default("active"),
    accessCount: integer("access_count").notNull().default(0),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_credentials_token").on(table.accessToken),
    index("idx_credentials_user").on(table.userId),
    index("idx_credentials_status").on(table.userId, table.status),
  ]
);

export const credentialsRelations = relations(credentials, ({ one, many }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
  accessLogs: many(accessLogs),
  credentialVaults: many(credentialVaults),
}));

// ============================================================
// 3b. credential_vaults — 信使可查看的密文范围
// ============================================================

export const credentialVaults = pgTable(
  "credential_vaults",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    credentialId: uuid("credential_id")
      .notNull()
      .references(() => credentials.id, { onDelete: "cascade" }),
    vaultId: uuid("vault_id")
      .notNull()
      .references(() => vaults.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_cv_cred_vault").on(table.credentialId, table.vaultId),
    index("idx_cv_credential").on(table.credentialId),
  ]
);

export const credentialVaultsRelations = relations(credentialVaults, ({ one }) => ({
  credential: one(credentials, {
    fields: [credentialVaults.credentialId],
    references: [credentials.id],
  }),
  vault: one(vaults, {
    fields: [credentialVaults.vaultId],
    references: [vaults.id],
  }),
}));

// ============================================================
// 4. access_logs — 访问审计日志
// ============================================================

export const accessLogs = pgTable(
  "access_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    credentialId: uuid("credential_id").references(() => credentials.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    eventType: eventTypeEnum("event_type").notNull(),
    result: accessResultEnum("result").notNull(),

    reason: varchar("reason", { length: 256 }),
    ipAddress: inet("ip_address"),
    userAgent: varchar("user_agent", { length: 512 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_logs_user").on(table.userId, table.createdAt.desc()),
    index("idx_logs_credential").on(
      table.credentialId,
      table.createdAt.desc()
    ),
    index("idx_logs_event").on(table.eventType, table.createdAt.desc()),
  ]
);

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
  }),
  credential: one(credentials, {
    fields: [accessLogs.credentialId],
    references: [credentials.id],
  }),
}));

// ============================================================
// 类型导出
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vault = typeof vaults.$inferSelect;
export type NewVault = typeof vaults.$inferInsert;
export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;
export type AccessLog = typeof accessLogs.$inferSelect;
export type NewAccessLog = typeof accessLogs.$inferInsert;

// ============================================================
// 6. subscriptions — 订阅记录
// ============================================================

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "annual",
  "lifetime",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "expired",
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paypalSubscriberId: varchar("paypal_subscriber_id", { length: 128 }),
    paypalSubscriptionId: varchar("paypal_subscription_id", { length: 128 }).unique(),
    plan: subscriptionPlanEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_subscriptions_user").on(table.userId),
    index("idx_subscriptions_paypal_subscriber").on(table.paypalSubscriberId),
  ]
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

// ============================================================
// 5. verification_codes — 验证码
// ============================================================

export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    target: varchar("target", { length: 255 }).notNull(),
    codeHash: varchar("code_hash", { length: 64 }).notNull(),
    purpose: varchar("purpose", { length: 32 }).notNull().default("bind"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    used: smallint("used").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_vc_target").on(table.target, table.purpose),
    index("idx_vc_expires").on(table.expiresAt),
  ]
);
