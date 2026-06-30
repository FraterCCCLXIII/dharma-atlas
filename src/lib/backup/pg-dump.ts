import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import type { ParsedDatabaseUrl } from "./db-url";

async function commandExists(command: string): Promise<boolean> {
  try {
    await access(command, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function runCommand(
  command: string,
  args: string[],
  env: Record<string, string | undefined>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}: ${stderr.trim()}`));
    });
  });
}

async function dumpWithPgDump(
  config: ParsedDatabaseUrl,
  outputPath: string,
): Promise<void> {
  await runCommand(
    "pg_dump",
    [
      "-h",
      config.host,
      "-p",
      config.port,
      "-U",
      config.user,
      "-d",
      config.database,
      "--no-owner",
      "--no-acl",
      "-F",
      "p",
      "-f",
      outputPath,
    ],
    { PGPASSWORD: config.password },
  );
}

async function dumpWithDocker(
  config: ParsedDatabaseUrl,
  outputPath: string,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const out = createWriteStream(outputPath);
    const child = spawn(
      "docker",
      [
        "compose",
        "exec",
        "-T",
        "postgres",
        "pg_dump",
        "-U",
        config.user,
        "-d",
        config.database,
        "--no-owner",
        "--no-acl",
      ],
      {
        env: { ...process.env, PGPASSWORD: config.password },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.stdout.pipe(out);
    out.on("error", reject);
    child.on("error", reject);
    child.on("close", (code) => {
      out.end();
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`docker compose pg_dump failed (${code}): ${stderr.trim()}`));
    });
  });
}

export async function dumpDatabase(
  config: ParsedDatabaseUrl,
  outputPath: string,
): Promise<"pg_dump" | "docker"> {
  if (await commandExists("pg_dump")) {
    await dumpWithPgDump(config, outputPath);
    return "pg_dump";
  }

  await dumpWithDocker(config, outputPath);
  return "docker";
}
