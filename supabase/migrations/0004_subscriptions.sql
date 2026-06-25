-- 0004: 订阅系统
-- PayPal：年费循环扣款 + 终身一次性

CREATE TYPE subscription_plan AS ENUM ('annual', 'lifetime');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paypal_subscriber_id VARCHAR(128),
    paypal_subscription_id VARCHAR(128) UNIQUE,
    plan subscription_plan NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paypal_subscriber ON subscriptions(paypal_subscriber_id);
