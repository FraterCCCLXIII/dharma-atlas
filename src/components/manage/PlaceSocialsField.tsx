"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { savePlaceSocialsAction } from "@/app/manage/actions/place-profile";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { PlaceSocialIcon } from "@/components/place/PlaceSocialIcon";
import {
  PLACE_SOCIAL_PLATFORM_DEFS,
  getPlaceSocialPlatformDef,
  type PlaceSocialPlatform,
} from "@/lib/place-socials";
import type { PlaceSocialInput } from "@/lib/validations/place-profile";
import type { PlaceSocial } from "@/types/place";

type SocialDraft = PlaceSocialInput & { clientKey: string };

function newClientKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `social-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toDraft(social: PlaceSocial): SocialDraft {
  return {
    id: social.id,
    platform: social.platform as PlaceSocialPlatform,
    url: social.url,
    label: social.label ?? null,
    sortOrder: social.sortOrder,
    clientKey: `saved-${social.id}`,
  };
}

function emptySocial(sortOrder: number): SocialDraft {
  return {
    platform: "instagram",
    url: "",
    label: null,
    sortOrder,
    clientKey: newClientKey(),
  };
}

function toPayload(socials: SocialDraft[]): PlaceSocialInput[] {
  return socials.map((social, index) => ({
    id: social.id,
    platform: social.platform,
    url: social.url.trim(),
    label: social.platform === "other" ? social.label?.trim() || null : null,
    sortOrder: index,
  }));
}

interface PlaceSocialsFieldProps {
  placeId: string;
  initialSocials: PlaceSocial[];
  /** When false, omit the field’s own heading (e.g. admin FormSection provides one). */
  showHeading?: boolean;
}

export function PlaceSocialsField({
  placeId,
  initialSocials,
  showHeading = true,
}: PlaceSocialsFieldProps) {
  const listId = useId();
  const [socials, setSocials] = useState<SocialDraft[]>(() =>
    initialSocials.length > 0 ? initialSocials.map(toDraft) : [],
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateSocial(clientKey: string, patch: Partial<SocialDraft>) {
    setSocials((current) =>
      current.map((social) =>
        social.clientKey === clientKey ? { ...social, ...patch } : social,
      ),
    );
    setSaved(false);
  }

  function addSocial() {
    setSocials((current) => [...current, emptySocial(current.length)]);
    setSaved(false);
  }

  function removeSocial(clientKey: string) {
    setSocials((current) => current.filter((social) => social.clientKey !== clientKey));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = toPayload(socials);
      for (const social of payload) {
        if (!social.url) {
          throw new Error("Each social link needs a URL starting with http:// or https://");
        }
        if (social.platform === "other" && !social.label) {
          throw new Error("Add a label for Other links");
        }
      }
      const savedRows = await savePlaceSocialsAction(placeId, payload);
      setSocials(savedRows.map(toDraft));
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save social links");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {showHeading ? (
        <div>
          <h3 className="text-sm font-semibold text-ink">Social links</h3>
          <p className="mt-1 text-xs text-ink-muted">
            YouTube, Instagram, Facebook, X, and other profiles visitors can follow.
          </p>
        </div>
      ) : null}

      <ul id={listId} className="space-y-3">
        {socials.map((social, index) => {
          const def = getPlaceSocialPlatformDef(social.platform);
          return (
            <li
              key={social.clientKey}
              className="rounded-xl border border-border bg-surface-elevated p-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-2.5 text-ink-secondary">
                  <PlaceSocialIcon platform={social.platform} />
                </span>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField id={`${social.clientKey}-platform`} label="Platform">
                      <select
                        id={`${social.clientKey}-platform`}
                        value={social.platform}
                        onChange={(e) =>
                          updateSocial(social.clientKey, {
                            platform: e.target.value as PlaceSocialPlatform,
                            label:
                              e.target.value === "other" ? social.label : null,
                          })
                        }
                        className={fieldClassName}
                      >
                        {PLACE_SOCIAL_PLATFORM_DEFS.map((platform) => (
                          <option key={platform.id} value={platform.id}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    {social.platform === "other" ? (
                      <FormField id={`${social.clientKey}-label`} label="Label">
                        <input
                          id={`${social.clientKey}-label`}
                          value={social.label ?? ""}
                          onChange={(e) =>
                            updateSocial(social.clientKey, {
                              label: e.target.value || null,
                            })
                          }
                          className={fieldClassName}
                          placeholder="e.g. Bluesky, Discord"
                        />
                      </FormField>
                    ) : (
                      <div className="hidden sm:block" aria-hidden />
                    )}
                  </div>
                  <FormField id={`${social.clientKey}-url`} label="URL">
                    <input
                      id={`${social.clientKey}-url`}
                      type="url"
                      value={social.url}
                      onChange={(e) =>
                        updateSocial(social.clientKey, { url: e.target.value })
                      }
                      className={fieldClassName}
                      placeholder={def.placeholder}
                    />
                  </FormField>
                </div>
                <button
                  type="button"
                  onClick={() => removeSocial(social.clientKey)}
                  className="mt-1 rounded-lg p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remove social link ${index + 1}`}
                >
                  <Trash size={18} weight="bold" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {socials.length === 0 ? (
        <p className="text-sm text-ink-muted">No social links yet.</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addSocial}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
        >
          <Plus size={16} weight="bold" />
          Add social link
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className={submitButtonClassName}
        >
          {saving ? "Saving…" : "Save social links"}
        </button>
        {saved && <span className="text-sm text-ink-muted">Saved</span>}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
