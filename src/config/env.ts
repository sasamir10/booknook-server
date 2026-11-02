import "dotenv/config";
import { configureDevelopmentDns } from "./development-dns.js";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DNS_SERVERS: z.string().optional(),
  DB_NAME: z.string().min(1).default("booknook"),
  BETTER_AUTH_URL: z.string().url(),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  BORROW_DURATION_DAYS: z.coerce.number().int().min(1).max(90).default(7),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid server environment: ${parsed.error.issues.map((i) => i.path.join(".") + " " + i.message).join("; ")}`);
}

export const env = parsed.data;

// Respect only an explicit development NODE_ENV. Production never changes its resolver.
if (configureDevelopmentDns(process.env.NODE_ENV, env.MONGODB_DNS_SERVERS)) {
  console.info("BookNook development DNS override enabled.");
}
