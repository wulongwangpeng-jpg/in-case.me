-- 0006: 新增事件类型 — 信使接受 + 用户预警 + 凭证恢复
-- 使用 DROP + ADD CONSTRAINT 模式（兼容迁移 0001 的 VARCHAR+CHECK 定义，而非 PG ENUM）
ALTER TABLE access_logs DROP CONSTRAINT IF EXISTS access_logs_event_type_check;
ALTER TABLE access_logs ADD CONSTRAINT access_logs_event_type_check CHECK (event_type IN (
  'user_renewal',
  'messenger_attempt',
  'blocked_still_active',
  'data_delivered',
  'credential_created',
  'credential_revoked',
  'credential_restored',
  'messenger_notify_0h',
  'messenger_notify_24h',
  'messenger_notify_48h',
  'messenger_reply_safe',
  'messenger_reply_lost',
  'messenger_auto_deliver',
  'credential_accepted',
  'user_warned_80pct',
  'user_warned_90pct',
  'threshold_updated'
));
