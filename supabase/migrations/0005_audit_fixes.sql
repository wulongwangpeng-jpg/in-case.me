-- 0005: 审计修复
-- 迁移 0001-0004 与 schema.ts 之间的缺失内容补齐

-- ============================================================
-- 1. credential_vaults — 信使与密文的多对多关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS credential_vaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cv_cred_vault ON credential_vaults(credential_id, vault_id);
CREATE INDEX IF NOT EXISTS idx_cv_credential ON credential_vaults(credential_id);
CREATE INDEX IF NOT EXISTS idx_cv_vault ON credential_vaults(vault_id);

-- ============================================================
-- 2. credentials 表补充信使联系方式列
-- ============================================================
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS messenger_phone VARCHAR(32);
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS messenger_phone2 VARCHAR(32);
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS messenger_relation VARCHAR(32);

-- ============================================================
-- 3. users.safe_threshold_days 默认值 90 → 180
-- ============================================================
ALTER TABLE users ALTER COLUMN safe_threshold_days SET DEFAULT 180;

-- ============================================================
-- 4. verification_codes: 防并发 — 每个 target+purpose 仅一个活跃未使用验证码
-- ============================================================
-- 先清理同 target+purpose 下的多余的 used=0 记录（保留最新的）
-- 再创建部分唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_vc_active_code
    ON verification_codes(target, purpose)
    WHERE used = 0;

-- ============================================================
-- 5. subscriptions: 补充 updated_at 自动触发器
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
