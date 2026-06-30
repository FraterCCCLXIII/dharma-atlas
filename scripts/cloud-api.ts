#!/usr/bin/env tsx
/**
 * Remote admin API CLI for Cursor / local scripts.
 *
 * Usage:
 *   npm run cloud -- seed --from-files
 *   npm run cloud -- upload-place-photo <placeId> <filePath>
 *   npm run cloud -- update-place <placeId> <jsonPath>
 *   npm run cloud -- delete-place <placeId>
 *   npm run cloud -- revalidate --all
 */

import { readFileSync } from "node:fs";
import { createAdminApiClientFromEnv } from "./lib/admin-api-client";

const [, , command, ...args] = process.argv;

function usage() {
  console.log(`Usage:
  npm run cloud -- seed [--from-files] [--places=path.json] [--teachers=path.json]
  npm run cloud -- upload-place-photo <placeId> <filePath>
  npm run cloud -- delete-place-photo <placeId> <photoId>
  npm run cloud -- update-place <placeId> <jsonPath>
  npm run cloud -- create-place <jsonPath>
  npm run cloud -- delete-place <placeId>
  npm run cloud -- upload-teacher-photo <slug> <filePath> [--hero]
  npm run cloud -- revalidate [--all] [path...]

Env (in .env.local):
  REMOTE_APP_URL=https://your-domain.com
  ADMIN_API_KEY=your-secret
`);
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

async function main() {
  if (!command || command === "--help" || command === "-h") {
    usage();
    process.exit(command ? 0 : 1);
  }

  const client = createAdminApiClientFromEnv();

  switch (command) {
    case "seed": {
      const fromFiles = args.includes("--from-files");
      const placesArg = args.find((a) => a.startsWith("--places="));
      const teachersArg = args.find((a) => a.startsWith("--teachers="));
      const payload: {
        fromFiles?: boolean;
        places?: unknown[];
        teachers?: unknown[];
        includeOntology?: boolean;
      } = { fromFiles, includeOntology: true };

      if (placesArg) {
        const data = readJson(placesArg.slice("--places=".length));
        payload.places = Array.isArray(data) ? data : data.places;
      }
      if (teachersArg) {
        const data = readJson(teachersArg.slice("--teachers=".length));
        payload.teachers = Array.isArray(data) ? data : data.teachers;
      }

      const result = await client.seed(payload);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case "upload-place-photo": {
      const [placeId, filePath] = args;
      if (!placeId || !filePath) throw new Error("Usage: upload-place-photo <placeId> <filePath>");
      const result = await client.uploadPlacePhoto(placeId, filePath);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case "delete-place-photo": {
      const [placeId, photoIdRaw] = args;
      if (!placeId || !photoIdRaw) throw new Error("Usage: delete-place-photo <placeId> <photoId>");
      const result = await client.deletePlacePhoto(placeId, Number(photoIdRaw));
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case "create-place": {
      const [jsonPath] = args;
      if (!jsonPath) throw new Error("Usage: create-place <jsonPath>");
      const result = await client.createPlace(readJson(jsonPath));
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case "update-place": {
      const [placeId, jsonPath] = args;
      if (!placeId || !jsonPath) throw new Error("Usage: update-place <placeId> <jsonPath>");
      const result = await client.updatePlace(placeId, readJson(jsonPath));
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case "delete-place": {
      const [placeId] = args;
      if (!placeId) throw new Error("Usage: delete-place <placeId>");
      const result = await client.deletePlace(placeId);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case "upload-teacher-photo": {
      const hero = args.includes("--hero");
      const positional = args.filter((a) => !a.startsWith("--"));
      const [slug, filePath] = positional;
      if (!slug || !filePath) throw new Error("Usage: upload-teacher-photo <slug> <filePath> [--hero]");
      const result = await client.uploadTeacherPhoto(slug, filePath, hero ? "hero" : "portrait");
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case "revalidate": {
      const all = args.includes("--all");
      const paths = args.filter((a) => !a.startsWith("--"));
      const result = await client.revalidate(paths, all);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    default:
      usage();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
