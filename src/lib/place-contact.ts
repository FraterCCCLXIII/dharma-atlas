import type { Place } from "@/types/place";

export function formatPhoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? `tel:${digits}` : `tel:${digits}`;
}

export function formatWebsiteHref(website: string): string {
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }
  return `https://${website}`;
}

export function displayWebsite(website: string): string {
  return website.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function hasContactInfo(place: Place): boolean {
  return Boolean(place.address || place.phone || place.website);
}
