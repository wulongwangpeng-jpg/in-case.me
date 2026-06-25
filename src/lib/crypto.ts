/**
 * 「万一呢」零知识加密管线 v1.0
 *
 * 核心原则：
 *  - 用户密码永不上传服务端
 *  - 加密/解密 100% 在浏览器端完成
 *  - 服务端只存储：密文 + 盐 + IV
 *  - 信使解密时同样在本地完成
 *
 * 算法：PBKDF2 (密钥派生) + AES-256-GCM (加密)
 */

// ──── 类型 ────

export interface EncryptionPackage {
  ciphertext: string;  // Base64 密文
  salt: string;        // PBKDF2 盐 (Base64)
  iv: string;          // AES-GCM 初始向量 (Base64)
  version: number;     // 加密协议版本
}

export interface VaultPayload {
  aliasName?: string;
  memoryHint?: string;
  categoryTag?: string;
  content: string;  // 明文 JSON 内容（加密前）
}

// ──── 常量 ────

const PBKDF2_ITERATIONS = 100_000;
const AES_KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const CURRENT_VERSION = 1;

// ──── 工具函数 ────

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length)) as Uint8Array<ArrayBuffer>;
}

// ──── 密钥派生 ────

async function deriveKey(
  password: string,
  salt: BufferSource
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

// ──── 加密 ────

/**
 * 加密任意文本内容
 * @param plaintext - 明文内容
 * @param password - 用户密码（不上传服务端）
 * @returns 加密包（密文+盐+IV），可直接存入数据库
 */
export async function encryptContent(
  plaintext: string,
  password: string
): Promise<EncryptionPackage> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  return {
    ciphertext: bufToBase64(cipherBuffer),
    salt: bufToBase64(salt),
    iv: bufToBase64(iv),
    version: CURRENT_VERSION,
  };
}

/**
 * 加密结构化对象（内部自动 JSON.stringify）
 */
export async function encryptPayload(
  payload: VaultPayload,
  password: string
): Promise<EncryptionPackage & { aliasName?: string; memoryHint?: string; categoryTag?: string }> {
  const plaintext = JSON.stringify(payload.content);
  const pkg = await encryptContent(plaintext, password);

  return {
    ...pkg,
    aliasName: payload.aliasName,
    memoryHint: payload.memoryHint,
    categoryTag: payload.categoryTag,
  };
}

// ──── 解密 ────

/**
 * 解密内容
 * @param pkg - 加密包（从数据库读取的密文+盐+IV）
 * @param password - 用户/信使输入的密码
 * @returns 明文文本
 */
export async function decryptContent(
  pkg: EncryptionPackage,
  password: string
): Promise<string> {
  const salt = base64ToBuf(pkg.salt);
  const iv = base64ToBuf(pkg.iv);
  const ciphertext = base64ToBuf(pkg.ciphertext);
  const key = await deriveKey(password, salt);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plainBuffer);
}

/**
 * 解密并解析为 JSON 对象
 */
export async function decryptToJSON<T = unknown>(
  pkg: EncryptionPackage,
  password: string
): Promise<T> {
  const text = await decryptContent(pkg, password);
  return JSON.parse(text) as T;
}

// ──── 凭证生成 ────

const ADJECTIVES = [
  "枫叶", "星辰", "海风", "暖阳", "竹林", "雪花", "月光", "樱花",
  "银河", "橙子", "松果", "贝壳", "蝴蝶", "麦田", "北极", "灯塔",
];

const ANIMALS = [
  "长颈鹿", "海豚", "猫头鹰", "小熊猫", "蓝鲸", "企鹅", "松鼠", "狐狸",
  "白鸽", "燕子", "考拉", "猎豹", "羚羊", "海龟", "蜂鸟", "大象",
];

/**
 * 生成人类友好凭证短码
 * 格式：「枫叶-长颈鹿-37」
 * 组合数：16×16×99 ≈ 25,000，足够防止碰撞
 */
export function generateHumanCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}-${animal}-${num}`;
}

/**
 * 生成安全令牌（SHA-256 哈希）
 */
export async function generateAccessToken(
  userId: string,
  humanCode: string
): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${userId}:${humanCode}:${Date.now()}:${crypto.randomUUID()}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufToBase64(hash).replace(/[/+]/g, "_").slice(0, 64);
}

// ──── 环境检测 ────

export function isCryptoAvailable(): boolean {
  return (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.subtle !== "undefined"
  );
}
