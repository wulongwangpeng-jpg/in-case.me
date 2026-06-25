/**
 * 注册 PayPal Webhook URL
 *
 * 用法: node scripts/register-paypal-webhook.cjs
 *
 * 1) 检查是否已有同 URL 的 webhook
 * 2) 没有则创建，订阅全部 5 种事件
 * 3) 输出 WEBHOOK_ID
 */

const https = require("https");

const BASE = "https://api-m.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const WEBHOOK_URL = "https://in-case.me/api/paypal/webhook";

const EVENT_TYPES = [
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "PAYMENT.SALE.COMPLETED",
];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set in environment");
  process.exit(1);
}

async function paypalFetch(path, options = {}) {
  // OAuth
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const tokenRes = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`OAuth failed: ${tokenRes.status} ${err}`);
  }

  const { access_token } = await tokenRes.json();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!res.ok) {
    throw new Error(`PayPal API error ${res.status}: ${typeof body === "object" ? JSON.stringify(body) : body}`);
  }

  return body;
}

async function main() {
  console.log("🔍 Checking existing PayPal webhooks...\n");

  // 1) 列出已有 webhooks
  const { webhooks } = await paypalFetch("/v1/notifications/webhooks");
  console.log(`   Found ${webhooks.length} existing webhook(s)`);

  for (const wh of webhooks) {
    console.log(`   - ${wh.id}: ${wh.url}`);
    if (wh.url === WEBHOOK_URL) {
      console.log(`\n✅ Webhook already registered for ${WEBHOOK_URL}`);
      console.log(`   WEBHOOK_ID=${wh.id}`);
      return wh.id;
    }
  }

  // 2) 创建新的 webhook
  console.log(`\n📝 Registering new webhook: ${WEBHOOK_URL}`);
  const created = await paypalFetch("/v1/notifications/webhooks", {
    method: "POST",
    body: JSON.stringify({
      url: WEBHOOK_URL,
      event_types: EVENT_TYPES.map((name) => ({ name })),
    }),
  });

  console.log(`\n✅ Webhook created!`);
  console.log(`   ID:  ${created.id}`);
  console.log(`   URL: ${created.url}`);
  console.log(`   Events: ${created.event_types?.map((e) => e.name).join(", ")}`);
  console.log(`\n⚠️  Now add to Vercel: PAYPAL_WEBHOOK_ID=${created.id}`);
  console.log(`   Or update .env.local and run: node scripts/set-vercel-env.cjs`);

  return created.id;
}

main()
  .then((id) => {
    if (id) console.log(`\n🔑 PAYPAL_WEBHOOK_ID=${id}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  });
