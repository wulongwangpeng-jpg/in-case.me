-- 0003: 死信通知新事件类型（扩展 CHECK 约束）
ALTER TABLE access_logs DROP CONSTRAINT IF EXISTS access_logs_event_type_check;
ALTER TABLE access_logs ADD CONSTRAINT access_logs_event_type_check CHECK (event_type IN (
  'user_renewal',
  'messenger_attempt',
  'blocked_still_active',
  'data_delivered',
  'credential_created',
  'credential_revoked',
  'messenger_notify_0h',
  'messenger_notify_24h',
  'messenger_notify_48h',
  'messenger_reply_safe',
  'messenger_reply_lost',
  'messenger_auto_deliver'
));
