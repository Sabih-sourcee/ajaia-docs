// One-time helper to apply db/schema.sql and db/seed.sql to POSTGRES_URL.
// Usage: node scripts/migrate.mjs
import { readFileSync } from "fs";
import { Client } from "pg";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("POSTGRES_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}

const client = new Client({ connectionString });

async function run() {
  await client.connect();
  const schema = readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  const seed = readFileSync(path.join(__dirname, "..", "db", "seed.sql"), "utf8");
  console.log("Applying schema.sql...");
  await client.query(schema);
  console.log("Applying seed.sql...");
  await client.query(seed);
  console.log("Done.");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
