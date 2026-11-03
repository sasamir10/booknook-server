export function isCorsOriginAllowed(origin: string | undefined, nodeEnv: string, clientUrl: string): boolean {
  if (!origin) return true;
  if (origin === clientUrl) return true;
  return nodeEnv === "development" && origin === "http://localhost:3000";
}
