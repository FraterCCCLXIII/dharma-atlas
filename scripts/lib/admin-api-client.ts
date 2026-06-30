import { readFileSync } from "node:fs";

export type AdminApiClientOptions = {
  baseUrl: string;
  apiKey: string;
};

export class AdminApiClient {
  constructor(private readonly options: AdminApiClientOptions) {}

  private url(path: string) {
    const base = this.options.baseUrl.replace(/\/$/, "");
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  }

  private headers(extra?: HeadersInit): HeadersInit {
    return {
      Authorization: `Bearer ${this.options.apiKey}`,
      ...extra,
    };
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(this.url(path), {
      ...init,
      headers: this.headers(init?.headers),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const message =
        typeof data.error === "string" ? data.error : `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data as T;
  }

  listPlaces() {
    return this.request<{ places: unknown[]; count: number }>("/api/admin/places");
  }

  getPlace(id: string) {
    return this.request<{ place: unknown }>(`/api/admin/places/${encodeURIComponent(id)}`);
  }

  createPlace(body: unknown) {
    return this.request<{ place: unknown }>("/api/admin/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  updatePlace(id: string, body: unknown) {
    return this.request<{ place: unknown }>(`/api/admin/places/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  deletePlace(id: string) {
    return this.request<{ id: string; deleted: boolean }>(
      `/api/admin/places/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  }

  async uploadPlacePhoto(id: string, filePath: string) {
    const buffer = readFileSync(filePath);
    const form = new FormData();
    form.append("file", new Blob([buffer]), filePath.split("/").pop() ?? "photo.jpg");

    const response = await fetch(this.url(`/api/admin/places/${encodeURIComponent(id)}/photos`), {
      method: "POST",
      headers: this.headers(),
      body: form,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
    }
    return data as { photo: unknown };
  }

  deletePlacePhoto(placeId: string, photoId: number) {
    return this.request<{ ok: boolean }>(
      `/api/admin/places/${encodeURIComponent(placeId)}/photos/${photoId}`,
      { method: "DELETE" },
    );
  }

  seed(body: {
    places?: unknown[];
    teachers?: unknown[];
    fromFiles?: boolean;
    includeOntology?: boolean;
    forceFields?: string[];
  }) {
    return this.request<{ ok: boolean; places: number; teachers: number; ontologyNodes: number }>(
      "/api/admin/seed",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
  }

  revalidate(paths?: string[], all = false) {
    return this.request<{ ok: boolean }>("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(all ? { all: true } : { paths }),
    });
  }

  createTeacher(body: unknown) {
    return this.request<{ teacher: unknown }>("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  updateTeacher(slug: string, body: unknown) {
    return this.request<{ teacher: unknown }>(
      `/api/admin/teachers/${encodeURIComponent(slug)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
  }

  deleteTeacher(slug: string) {
    return this.request<{ slug: string; deleted: boolean }>(
      `/api/admin/teachers/${encodeURIComponent(slug)}`,
      { method: "DELETE" },
    );
  }

  async uploadTeacherPhoto(slug: string, filePath: string, variant: "portrait" | "hero" = "portrait") {
    const buffer = readFileSync(filePath);
    const form = new FormData();
    form.append("file", new Blob([buffer]), filePath.split("/").pop() ?? "photo.jpg");
    form.append("variant", variant);

    const response = await fetch(
      this.url(`/api/admin/teachers/${encodeURIComponent(slug)}/photos`),
      {
        method: "POST",
        headers: this.headers(),
        body: form,
      },
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
    }
    return data as { path: string; variant: string };
  }
}

export function createAdminApiClientFromEnv() {
  const baseUrl = process.env.REMOTE_APP_URL?.trim();
  const apiKey = process.env.ADMIN_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    throw new Error("Set REMOTE_APP_URL and ADMIN_API_KEY in .env.local");
  }

  return new AdminApiClient({ baseUrl, apiKey });
}
