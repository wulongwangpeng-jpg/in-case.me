/**
 * PayPal REST API 工具
 *
 * 海外站收款：Orders API v2（终身）+ Subscriptions API v1（年费）
 * 零外部 SDK 依赖，直接 HTTP 调用
 */

const BASE_URL = "https://api-m.paypal.com";

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

// —— OAuth ——

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal OAuth failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedAccessToken!;
}

async function paypalFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let body: any;
  try { body = JSON.parse(text); } catch { body = text; }

  if (!res.ok) {
    const errMsg = typeof body === "object" ? JSON.stringify(body) : body;
    throw new Error(`PayPal API error ${res.status}: ${errMsg}`);
  }

  return body;
}

// —— Orders API v2（终身 / 一次性支付）——

export interface CreateOrderInput {
  amount: number;  // USD，不含小数（如 198）
  description: string;
  userId: string;
  planId: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createOrder(input: CreateOrderInput) {
  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: input.amount.toFixed(2),
        },
        description: input.description,
        custom_id: `${input.userId}|${input.planId}`,
      },
    ],
    application_context: {
      brand_name: "In Case Digital",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
    },
  };

  return paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function captureOrder(orderId: string) {
  return paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
}

// —— Subscriptions API v1（年费 / 循环扣款）——

let cachedPlanId: string | null = null;

async function getOrCreateAnnualPlan(): Promise<string> {
  // 1) 优先使用环境变量中固定的 Plan ID（防冷启动重复创建）
  const envPlanId = process.env.PAYPAL_PLAN_ID;
  if (envPlanId) {
    cachedPlanId = envPlanId;
    return envPlanId;
  }

  if (cachedPlanId) return cachedPlanId;

  // 2) 查是否已有活跃的 Plan（列表取第一个匹配的）
  try {
    const plans = await paypalFetch("/v1/billing/plans?status=ACTIVE&page_size=20");
    const existing = (plans.plans || []).find(
      (p: any) => p.name?.includes("In Case Annual")
    );
    if (existing) {
      cachedPlanId = existing.id;
      console.log(`[PayPal] Reusing existing plan: ${existing.id} — set PAYPAL_PLAN_ID=${existing.id} to skip this lookup`);
      return existing.id;
    }
  } catch (e) {
    console.warn("[PayPal] Failed to list plans, will create new:", e);
  }

  // 3) 创建 Product
  const product = await paypalFetch("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: "In Case Annual",
      type: "SERVICE",
      category: "SOFTWARE",
      description: "In Case Digital Safety Net — Annual Subscription",
    }),
  });

  // 4) 创建 Plan
  const plan = await paypalFetch("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: product.id,
      name: "In Case Annual — $23/year",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "YEAR", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: "23", currency_code: "USD" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  });

  cachedPlanId = plan.id;
  console.log(`[PayPal] Created plan: ${plan.id}`);
  console.log(`[PayPal] ⚠️  Set PAYPAL_PLAN_ID=${plan.id} in env to prevent duplicate plans on cold starts.`);
  return plan.id!;
}

export interface CreateSubscriptionInput {
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const planId = await getOrCreateAnnualPlan();

  const body = {
    plan_id: planId,
    custom_id: `${input.userId}|annual`,
    application_context: {
      brand_name: "In Case Digital",
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
    },
  };

  return paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function cancelSubscription(subscriptionId: string, reason: string = "Cancelled by user") {
  return paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// —— Webhook 管理 ——

export interface PayPalWebhook {
  id: string;
  url: string;
  event_types: Array<{ name: string; description: string }>;
}

/** 列出当前 app 已注册的 webhooks */
export async function listWebhooks(): Promise<PayPalWebhook[]> {
  const data = await paypalFetch("/v1/notifications/webhooks");
  return data.webhooks || [];
}

/** 注册新的 webhook URL */
export async function createWebhook(url: string, eventTypes: string[]): Promise<PayPalWebhook> {
  const body = {
    url,
    event_types: eventTypes.map((name) => ({ name })),
  };
  return paypalFetch("/v1/notifications/webhooks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// —— Webhook 签名验证 ——

export async function verifyWebhookSignature(
  headers: {
    "paypal-auth-algo": string;
    "paypal-cert-url": string;
    "paypal-transmission-id": string;
    "paypal-transmission-sig": string;
    "paypal-transmission-time": string;
  },
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("[PayPal] Webhook ID not configured, skipping signature verification");
    return false;
  }

  try {
    const result = await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    });

    return result.verification_status === "SUCCESS";
  } catch (err) {
    console.error("[PayPal] Webhook verification failed:", err);
    return false;
  }
}
