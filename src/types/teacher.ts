export type Book = {
  title: string;
  year: number;
  publisher: string;
  url?: string;
};

export type Retreat = {
  title: string;
  dates: string;
  location: string;
  price?: string;
};

export type Relation = {
  slug?: string;
  name: string;
  role: string;
  note?: string;
};

export type Teacher = {
  slug: string;
  name: string;
  tradition: string;
  lineage: string;
  location: string;
  base?: string;
  yearsTeaching: number;
  birthYear?: number | null;
  deathYear?: number | null;
  languages: string[];
  shortBio: string;
  biography: string[];
  topics: string[];
  photo: string;
  heroPhoto?: string;
  website?: string | null;
  socials: { label: string; url: string }[];
  bibliography: Book[];
  retreats: Retreat[];
  relations?: {
    teachers?: Relation[];
    peers?: Relation[];
    students?: Relation[];
  };
};

export interface TeachersDataset {
  source: string;
  sourceName: string;
  count: number;
  teachers: Teacher[];
}

export function formatLifespan(teacher: Teacher): string | null {
  if (teacher.birthYear == null) return null;
  if (teacher.deathYear != null) return `${teacher.birthYear}–${teacher.deathYear}`;
  return `${teacher.birthYear}–`;
}

export function isDeceased(teacher: Teacher): boolean {
  return teacher.deathYear != null;
}
