import "dotenv/config";
import { configureDevelopmentDns } from "./development-dns.js";
import { loadServerEnvironment } from "./env-validation.js";

export const env = loadServerEnvironment(process.env);

// Respect only an explicit development NODE_ENV. Production never changes its resolver.
if (configureDevelopmentDns(process.env.NODE_ENV, env.MONGODB_DNS_SERVERS)) {
  console.info("BookNook development DNS override enabled.");
}
