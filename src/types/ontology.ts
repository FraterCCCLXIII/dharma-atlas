export type OntologyNodeType = "buddhist_root" | "lineage" | "subschool" | "tradition";

export type OntologyNode = {
  slug: string;
  label: string;
  parentSlug: string | null;
  sortOrder: number;
  nodeType: OntologyNodeType;
  filterId: string;
  placeTraditions: string[];
  inferPattern: string | null;
  appliesToLocations: boolean;
  appliesToPeople: boolean;
  defaultImagePath: string | null;
};

export type LineageSchoolDef = {
  slug: string;
  id: string;
  label: string;
  placeTraditions: string[];
};

export type SubschoolRule = {
  slug: string;
  label: string;
  lineageSchool: string;
  placeTraditions: string[];
  pattern: RegExp;
};

export type OtherTraditionDef = {
  filterId: string;
  label: string;
};

export type PlaceTraditionPickerOption = {
  value: string;
  label: string;
  group: "Buddhist" | "Other";
};

/** Runtime snapshot used by filter and matching logic. */
export type OntologySnapshot = {
  buddhistRoot: {
    slug: string;
    filterId: string;
    label: string;
  };
  lineageSchools: LineageSchoolDef[];
  subschoolLabels: Record<string, string>;
  subschoolRules: SubschoolRule[];
  otherTraditions: OtherTraditionDef[];
  buddhistPlaceTraditions: string[];
  placeTraditionPickerOptions: PlaceTraditionPickerOption[];
  traditionDefaultImages: Record<string, string>;
};

export type OntologyNodeInput = Omit<OntologyNode, "sortOrder"> & {
  sortOrder?: number;
};
