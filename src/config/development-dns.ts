import dns from "node:dns";
import { isIP } from "node:net";

export function configureDevelopmentDns(
  nodeEnv: string | undefined,
  configuredServers: string | undefined,
  setServers: (servers: string[]) => void = dns.setServers,
): boolean {
  if (nodeEnv !== "development" || !configuredServers?.trim()) return false;

  const servers = configuredServers.split(",").map((server) => server.trim());
  if (servers.some((server) => !server || isIP(server) === 0)) {
    throw new Error("MONGODB_DNS_SERVERS must be a comma-separated list of IP addresses in development.");
  }

  setServers(servers);
  return true;
}
