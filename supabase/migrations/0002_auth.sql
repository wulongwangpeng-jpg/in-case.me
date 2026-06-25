-- 0002: 身份绑定系统
-- 手机号/邮箱验证码登录

-- 1. 用户表加手机号字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 2. 验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target VARCHAR(255) NOT NULL,
  code_hash VARCHAR(64) NOT NULL,
  purpose VARCHAR(32) NOT NULL DEFAULT 'bind',
  expires_at TIMESTAMPTZ NOT NULL,
  used SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vc_target ON verification_codes(target, purpose);
CREATE INDEX IF NOT EXISTS idx_vc_expires ON verification_codes(expires_at);
