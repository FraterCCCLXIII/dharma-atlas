export type ParsedDatabaseUrl = {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
};

export function parseDatabaseUrl(databaseUrl: string): ParsedDatabaseUrl {
  const parsed = new URL(databaseUrl);
  const database = parsed.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URL is missing a database name.");
  }

  return {
    host: parsed.hostname,
    port: parsed.port || "5432",
    database,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}
