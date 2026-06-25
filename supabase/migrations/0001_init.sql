-- ============================================================
-- 「万一呢」v1.0 核心表结构
-- 设计原则：零知识加密 · 不存明文密码 · 纯时间戳比对
-- 数据库：PostgreSQL (Supabase)
-- ============================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. users — 用户表
-- ============================================================
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               VARCHAR(255) UNIQUE,       -- 可选邮箱，用于凭证投递
  nickname            VARCHAR(64),               -- 用户代号（非实名）
  last_active_time    TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- 最后活跃时间
  safe_threshold_days SMALLINT NOT NULL DEFAULT 90,        -- 安全阈值天数（45 或 90）
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 核心索引：信使提取时的唯一判断条件
-- 逻辑：last_active_time + safe_threshold_days < NOW() → 准予提取
CREATE INDEX idx_users_active ON users (last_active_time, safe_threshold_days);

COMMENT ON TABLE users IS '用户表：不存密码，身份由浏览器端凭证维系';
COMMENT ON COLUMN users.last_active_time IS '用户最后一次续期的时间戳';
COMMENT ON COLUMN users.safe_threshold_days IS '静默多少天后允许信使提取（45=情感低落 / 90=情感良好）';
COMMENT ON COLUMN users.nickname IS '用户自设代号，非实名，降低隐私顾虑';
COMMENT ON COLUMN users.email IS '可选，用于邮件发送信使凭证；不填则纯截图分享';


-- ============================================================
-- 2. vaults — 密文保险库
-- 零知识原则：服务端只存密文，解密钥仅存在于用户/信使前端
-- ============================================================
CREATE TABLE vaults (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 资产分类
  vault_type          VARCHAR(32) NOT NULL CHECK (vault_type IN (
                        'asset_inventory',   -- 数字资产线索备忘录
                        'farewell_letter',   -- 心里话/告别信
                        'wishlist'           -- 遗愿清单
                      )),

  -- 用户可见的轻量元数据（不加密，方便用户自己管理）
  alias_name          VARCHAR(128),             -- 资产别名/代号：「招行卡」「主微信号」
  memory_hint         VARCHAR(256),             -- 位置线索：「床头第三本书夹层」
  category_tag        VARCHAR(64),              -- 分类标签：social / payment / entertainment

  -- 加密核心字段（服务端永远看到的是乱码）
  encrypted_content   TEXT NOT NULL,             -- AES-256-GCM 加密的 Base64 密文
  encryption_salt     VARCHAR(64) NOT NULL,      -- PBKDF2 派生密钥的盐 (Base64)
  encryption_iv       VARCHAR(32) NOT NULL,      -- AES-GCM 初始向量 (Base64)

  -- 加密协议版本（未来算法升级用）
  encryption_version  SMALLINT NOT NULL DEFAULT 1,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vaults_user ON vaults (user_id, vault_type);
CREATE INDEX idx_vaults_category ON vaults (user_id, category_tag);

COMMENT ON TABLE vaults IS '密文保险库：所有敏感内容在前端加密后才存入此表';
COMMENT ON COLUMN vaults.encrypted_content IS '加密后的完整内容，服务端无法解密';
COMMENT ON COLUMN vaults.encryption_salt IS 'PBKDF2 盐值，与用户密码组合派生 AES 密钥';
COMMENT ON COLUMN vaults.encryption_iv IS 'AES-GCM 初始化向量，每次加密随机生成';
COMMENT ON COLUMN vaults.alias_name IS '资产代号，明文存储但无敏感信息（如"招行卡"而非卡号）';
COMMENT ON COLUMN vaults.memory_hint IS '线索提示，帮助用户/信使找到真实资产位置';
COMMENT ON COLUMN vaults.encryption_version IS '加密协议版本号，未来 v2/v3 平滑迁移';


-- ============================================================
-- 3. credentials — 信使提取凭证
-- 双码机制：human_code（人类友好短码）+ access_token（安全令牌）
-- ============================================================
CREATE TABLE credentials (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 信使信息
  messenger_email     VARCHAR(255),              -- 信使邮箱（可选）
  messenger_label     VARCHAR(64),               -- 信使称呼：「老妈」「发小张三」

  -- 双码机制
  human_code          VARCHAR(32) NOT NULL,       -- 人类友好短码：「枫叶-长颈鹿-37」
  access_token        VARCHAR(128) NOT NULL UNIQUE,  -- SHA-256 安全令牌（URL 参数）

  -- 状态
  status              VARCHAR(16) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'revoked', 'delivered')),
  access_count        INT NOT NULL DEFAULT 0,     -- 信使尝试访问次数
  last_accessed_at    TIMESTAMPTZ,                -- 最后访问时间

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_credentials_token ON credentials (access_token);
CREATE INDEX idx_credentials_user ON credentials (user_id);
CREATE INDEX idx_credentials_status ON credentials (user_id, status);

COMMENT ON TABLE credentials IS '信使凭证表：用户可创建多份凭证，分发给不同的信使';
COMMENT ON COLUMN credentials.human_code IS '人类友好短码，方便截图分享：枫叶-长颈鹿-37';
COMMENT ON COLUMN credentials.access_token IS 'SHA-256 安全令牌，用于 URL 参数验证，不可猜测';
COMMENT ON COLUMN credentials.status IS 'active=有效 / revoked=用户吊销 / delivered=已提取';


-- ============================================================
-- 4. access_logs — 访问审计日志
-- ============================================================
CREATE TABLE access_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credential_id       UUID REFERENCES credentials(id) ON DELETE SET NULL,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 事件类型
  event_type          VARCHAR(32) NOT NULL CHECK (event_type IN (
                        'user_renewal',            -- 用户情感续期
                        'messenger_attempt',       -- 信使尝试提取
                        'blocked_still_active',    -- 拦截：用户仍活跃
                        'data_delivered',          -- 密文已交付信使
                        'credential_created',      -- 凭证已创建
                        'credential_revoked'       -- 凭证已吊销
                      )),
  result              VARCHAR(16) NOT NULL CHECK (result IN ('allowed', 'denied')),

  -- 审计详情
  reason              VARCHAR(256),              -- 人类可读原因
  ip_address          INET,
  user_agent          VARCHAR(512),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON access_logs (user_id, created_at DESC);
CREATE INDEX idx_logs_credential ON access_logs (credential_id, created_at DESC);
CREATE INDEX idx_logs_event ON access_logs (event_type, created_at DESC);

COMMENT ON TABLE access_logs IS '审计日志：记录每一次续期、信使尝试、数据交付';
COMMENT ON COLUMN access_logs.event_type IS '事件类型枚举';
COMMENT ON COLUMN access_logs.reason IS '人类可读的解释文案，如"用户 47 天前活跃，距阈值还有 43 天"';


-- ============================================================
-- 触发器：自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaults_updated_at
  BEFORE UPDATE ON vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 辅助函数：判断用户是否已过静默期
-- 供 API 层调用：SELECT is_user_silent('user-uuid');
-- ============================================================
CREATE OR REPLACE FUNCTION is_user_silent(user_uuid UUID)
RETURNS TABLE(
  is_silent BOOLEAN,
  silent_days INT,
  remaining_days INT,
  threshold_days SMALLINT,
  last_active TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (u.last_active_time + (u.safe_threshold_days || ' days')::INTERVAL) < NOW() AS is_silent,
    CASE
      WHEN (u.last_active_time + (u.safe_threshold_days || ' days')::INTERVAL) < NOW()
      THEN DATE_PART('day', NOW() - (u.last_active_time + (u.safe_threshold_days || ' days')::INTERVAL))::INT
      ELSE 0
    END AS silent_days,
    CASE
      WHEN (u.last_active_time + (u.safe_threshold_days || ' days')::INTERVAL) >= NOW()
      THEN DATE_PART('day', (u.last_active_time + (u.safe_threshold_days || ' days')::INTERVAL) - NOW())::INT
      ELSE 0
    END AS remaining_days,
    u.safe_threshold_days AS threshold_days,
    u.last_active_time AS last_active
  FROM users u
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql;
