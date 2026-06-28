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
};

export type OntologyNodeInput = Omit<OntologyNode, "sortOrder"> & {
  sortOrder?: number;
};
