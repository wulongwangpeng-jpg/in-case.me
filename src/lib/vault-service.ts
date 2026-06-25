/**
 * 密文保险库服务层
 *
 * 职责：
 *  - 前端调用 encrypt → POST /api/vaults（只传密文元数据）
 *  - 用户查看 → GET /api/vaults → 返回密文 + 盐 + IV → 前端解密
 *  - 信使提取 → POST /api/unlock → 校验时间戳 → 下发密文包
 *
 * 服务端始终不接触明文密码和解密密钥。
 */

import { encryptPayload, decryptContent, type EncryptionPackage } from "./crypto";

// ──── 保存密文到保险库 ────

interface SaveVaultInput {
  vaultType: "asset_inventory" | "farewell_letter" | "wishlist";
  aliasName?: string;
  memoryHint?: string;
  categoryTag?: string;
  content: unknown; // 任意 JSON 可序列化对象
  password: string; // 用户密码（仅在前端使用，不上传）
}

export async function saveToVault(input: SaveVaultInput): Promise<{
  success: boolean;
  vaultId?: string;
  error?: string;
}> {
  if (!input.password || input.password.length < 4) {
    return { success: false, error: "密码至少需要 4 个字符" };
  }

  // ① 前端加密
  const pkg = await encryptPayload(
    {
      aliasName: input.aliasName,
      memoryHint: input.memoryHint,
      categoryTag: input.categoryTag,
      content: JSON.stringify(input.content),
    },
    input.password
  );

  // ② 上传密文到服务端
  const res = await fetch("/api/vaults", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vaultType: input.vaultType,
      aliasName: pkg.aliasName,
      memoryHint: pkg.memoryHint,
      categoryTag: pkg.categoryTag,
      encryptedContent: pkg.ciphertext,
      encryptionSalt: pkg.salt,
      encryptionIv: pkg.iv,
      encryptionVersion: pkg.version,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || "保存失败" };
  }

  const data = await res.json();
  return { success: true, vaultId: data.id };
}

// ──── 从保险库加载并解密 ────

interface LoadVaultResult {
  success: boolean;
  data?: unknown;
  metadata?: {
    aliasName?: string;
    memoryHint?: string;
    categoryTag?: string;
    vaultType: string;
  };
  error?: string;
}

export async function loadFromVault(
  vaultId: string,
  password: string
): Promise<LoadVaultResult> {
  // ① 从服务端获取密文
  const res = await fetch(`/api/vaults/${vaultId}`);
  if (!res.ok) {
    return { success: false, error: "密文不存在或已被删除" };
  }

  const vault = await res.json();

  // ② 前端解密
  try {
    const pkg: EncryptionPackage = {
      ciphertext: vault.encryptedContent,
      salt: vault.encryptionSalt,
      iv: vault.encryptionIv,
      version: vault.encryptionVersion,
    };

    const plaintext = await decryptContent(pkg, password);
    const data = JSON.parse(plaintext);

    return {
      success: true,
      data,
      metadata: {
        aliasName: vault.aliasName,
        memoryHint: vault.memoryHint,
        categoryTag: vault.categoryTag,
        vaultType: vault.vaultType,
      },
    };
  } catch {
    return { success: false, error: "密码错误，无法解密" };
  }
}

// ──── 信使申请解锁 ────

export interface UnlockResult {
  allowed: boolean;
  stage:
    | "credential_invalid"
    | "user_not_found"
    | "user_still_active"
    | "data_released";
  message: string;
  vaults?: Array<{
    id: string;
    vaultType: string;
    aliasName?: string | null;
    memoryHint?: string | null;
    encryptedContent: string;
    encryptionSalt: string;
    encryptionIv: string;
    encryptionVersion: number;
  }>;
  totalVaults?: number;
  silentDays?: number;
  remainingDays?: number;
}

export async function messengerUnlock(
  accessToken: string
): Promise<UnlockResult> {
  const res = await fetch("/api/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });

  return res.json();
}

// ──── 情感续期 ────

export async function renewStatus(
  activeDays: number
): Promise<{
  activeUntil: string;
  daysRemaining: number;
  isUrgent: boolean;
}> {
  const res = await fetch("/api/me/renew", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active_days: activeDays }),
  });

  return res.json();
}

// ──── 获取用户状态 ────

export async function getUserStatus(): Promise<{
  activeUntil: string;
  daysRemaining: number;
  isUrgent: boolean;
  thresholdDays: number;
  elapsedDays: number;
  elapsedPct: number;
  warningLevel: "normal" | "warning_80" | "warning_90" | "critical";
  hasPhone: boolean;
  hasEmail: boolean;
  maskedContact: string | null;
  vaultCount: number;
  credentialCount: number;
}> {
  const res = await fetch("/api/me/status");
  return res.json();
}
