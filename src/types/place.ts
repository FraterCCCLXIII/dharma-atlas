export type Faith = "Buddhist" | "Hindu";
export type PlaceType =
  | "Center"
  | "Temple"
  | "Monastery"
  | "Meditation Center"
  | "Institute"
  | "Ashram";

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
  isDraft?: boolean;
}

export interface PlacesDataset {
  source: string;
  sourceName: string;
  sourceCredit: string;
  count: number;
  places: Place[];
}
