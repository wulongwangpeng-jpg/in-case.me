# In Case &mdash; Your Digital Safety Net

**The only browser-side encrypted vault that your trusted contacts can open with just a link.**

[![AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-green)](LICENSE)
[![Web Crypto API](https://img.shields.io/badge/encryption-AES--256--GCM-blue)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![Zero Knowledge](https://img.shields.io/badge/architecture-zero--knowledge-purple)](https://in-case.me)
[![Live](https://img.shields.io/badge/live-in--case.me-warm)](https://in-case.me)

---

## The Problem

Your partner can't log into your accounts. Your co-founder doesn't know where the domains are registered. Your family has no idea which banks you use.

Most tools that try to solve this are CLI-based, USB-reliant, or require the people you trust to install software. The non-technical people in your life — the ones who actually need access — are left out.

## What In Case Does

- **List your accounts** — banking, crypto, domains, email, subscriptions, everything
- **Encrypt in your browser** — AES-256-GCM via Web Crypto API, zero-knowledge
- **Set a check-in timer** — if you go silent for your chosen period, access is released
- **Choose who sees what** — spouse gets banking, business partner gets domains
- **They just click a link** — no CLI, no USB, no app install

## How It Works

```
Your Browser (encrypt) ──→ Server stores ciphertext ──→ Contact opens link (decrypt)
         ↑                                                          ↑
    Only you have the key                               They get it after your quiet period
```

1. Generate an AES-256-GCM key in your browser
2. Encrypt vault items before uploading — the server never sees plaintext
3. Add trusted contacts (email or phone)
4. If you miss your check-in, contacts receive a link and decryption key

**We cannot access your data. Not because we promise — because we don't have the key.**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Encryption | Web Crypto API — AES-256-GCM + PBKDF2 |
| Database | Supabase |
| Payments | PayPal |
| Email | Resend |
| Hosting | Vercel |

## Live

**[in-case.me](https://in-case.me)** — $23/year or $198 lifetime. Free tier: 3 vault items + 1 contact.

## Free Tools

All browser-side, zero network requests, nothing stored:

| Tool | Link |
|------|------|
| Password Strength Checker | [in-case.me/tools/password-checker](https://in-case.me/tools/password-checker) |
| AES-256-GCM Encryption Demo | [in-case.me/tools/aes-demo](https://in-case.me/tools/aes-demo) |
| Digital Asset Inventory | [in-case.me/tools/asset-checklist](https://in-case.me/tools/asset-checklist) |
| Account Handover Checklist | [in-case.me/tools/account-audit](https://in-case.me/tools/account-audit) |

## Open Source

AGPL-3.0. Built in the open. Independent, bootstrapped, solo dev.

The code you're reading powers [in-case.me](https://in-case.me) — not a demo, not a subset. The encryption runs in your browser. Verify it yourself.

## Why AGPL?

Because zero-knowledge means nothing if you can't verify the client code. AGPL keeps the entire stack transparent — you can audit every line, run it yourself, and trust that the encryption happens where we say it happens.
