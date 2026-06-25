import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL, { max: 1, ssl: "require" });

const rows = await client`SELECT target, purpose, expires_at, created_at FROM verification_codes WHERE used = 0 ORDER BY created_at DESC LIMIT 5`;
console.log(JSON.stringify(rows, null, 2));

await client.end();
