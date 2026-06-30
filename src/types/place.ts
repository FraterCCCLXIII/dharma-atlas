export type Faith = "Buddhist" | "Hindu";
export type PlaceType =
  | "Center"
  | "Temple"
  | "Monastery"
  | "Meditation Center"
  | "Institute"
  | "Ashram";

export type CoordPrecision = "pin" | "address" | "city" | "region" | "unknown";

export type PhotoSource =
  | "website"
  | "google_places"
  | "wikimedia"
  | "osm"
  | "generated"
  | "admin";

export interface PlaceOpeningHours {
  weekdayDescriptions?: string[];
  openNow?: boolean;
  source?: "google_places";
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tradition: string;
  /** Manually curated school slugs when lineage is not in the place name. */
  schools?: string[];
  faith: Faith;
  type: PlaceType;
  folder: string;
  address: string;
  phone: string | null;
  website: string | null;
  description?: string;
  descriptionSource?: string;
  coordPrecision?: CoordPrecision;
  dataSource?: string;
  verifiedAt?: string;
  verifiedFields?: string[];
  qualityFlags?: string[];
  photo?: string;
  photoSource?: PhotoSource;
  googlePlaceId?: string;
  googleMapsUri?: string;
  openingHours?: PlaceOpeningHours;
  googleRating?: number;
  googleRatingCount?: number;
  businessStatus?: string;
  googlePrimaryType?: string;
  isDraft?: boolean;
}

export interface PlacesDataset {
  source: string;
  sourceName: string;
  sourceCredit: string;
  count: number;
  places: Place[];
}
