import { z } from "zod";

function isMongoUri(value: string): boolean {
  try {
    const uri = new URL(value);
    return (uri.protocol === "mongodb:" || uri.protocol === "mongodb+srv:") && Boolean(uri.hostname);
  } catch {
    return false;
  }
}

function isOrigin(value: string, production: boolean): boolean {
  try {
    const url = new URL(value);
    return url.origin === value && (!production || url.protocol === "https:");
  } catch {
    return false;
  }
}

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required.").refine(isMongoUri, "MONGODB_URI must be a valid mongodb:// or mongodb+srv:// URI."),
  DB_NAME: z.string().trim().min(1, "DB_NAME is required.").max(63, "DB_NAME must be 63 characters or fewer.").regex(/^[A-Za-z0-9_-]+$/, "DB_NAME must contain only letters, numbers, underscores, or hyphens."),
  MONGODB_DNS_SERVERS: z.string().optional(),
  BETTER_AUTH_URL: z.string().trim().min(1, "BETTER_AUTH_URL is required."),
  CLIENT_URL: z.string().trim().optional(),
  BORROW_DURATION_DAYS: z.coerce.number().int().min(1).max(90).default(7),
});

export type ServerEnvironment = z.infer<typeof schema> & { CLIENT_URL: string };

export function loadServerEnvironment(source: Record<string, string | undefined>): ServerEnvironment {
  if (source.NODE_ENV !== "development" && source.NODE_ENV !== "test" && source.NODE_ENV !== "production") {
    throw new Error("Invalid server environment: NODE_ENV must be set to development, test, or production.");
  }
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid server environment: ${details.join("; ")}`);
  }

  const value = parsed.data;
  const production = value.NODE_ENV === "production";
  const clientUrl = value.CLIENT_URL ?? (production ? undefined : "http://localhost:3000");
  const problems: string[] = [];

  if (!isOrigin(value.BETTER_AUTH_URL, production)) {
    problems.push(production ? "BETTER_AUTH_URL must be an HTTPS origin in production." : "BETTER_AUTH_URL must be an origin URL.");
  }
  if (!clientUrl) problems.push("CLIENT_URL is required in production.");
  else if (!isOrigin(clientUrl, production)) {
    problems.push(production ? "CLIENT_URL must be an HTTPS origin in production." : "CLIENT_URL must be an origin URL.");
  }
  if (production && clientUrl && value.BETTER_AUTH_URL !== clientUrl) {
    problems.push("BETTER_AUTH_URL and CLIENT_URL must match in production.");
  }

  if (problems.length) throw new Error(`Invalid server environment: ${problems.join(" ")}`);
  return { ...value, CLIENT_URL: clientUrl! };
}
