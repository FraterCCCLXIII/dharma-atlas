import type { Place } from "@/types/place";

/** Display labels for school slugs used in filters and tags. */
export const SCHOOL_LABELS: Record<string, string> = {
  // Tibetan
  nyingma: "Nyingma",
  kagyu: "Kagyu",
  gelug: "Gelug",
  sakya: "Sakya",
  bon: "Bon",
  shambhala: "Shambhala",
  "diamond-way": "Diamond Way",
  // Zen & related
  soto: "Soto",
  rinzai: "Rinzai",
  obaku: "Obaku",
  chan: "Chan",
  son: "Son (Korean)",
  thien: "Thiền (Vietnamese)",
  "sanbo-zen": "Sanbo Zen",
  "dharma-drum": "Dharma Drum",
  // Theravada
  vipassana: "Vipassana",
  insight: "Insight Meditation",
  "thai-forest": "Thai Forest",
  // Southeast Asian
  thai: "Thai",
  burmese: "Burmese",
  lao: "Lao",
  cambodian: "Cambodian",
  "sri-lankan": "Sri Lankan",
  // Pure Land
  "soka-gakkai": "Soka Gakkai",
  "jodo-shin": "Jodo Shin",
  "jodo-shu": "Jodo Shu",
};

/** Which traditions expose school-level filters. */
export const TRADITIONS_WITH_SCHOOLS = [
  "Tibetan",
  "Zen",
  "Theravada",
  "Southeast Asian",
  "Pure Land",
] as const;

type SchoolRule = {
  slug: string;
  traditions: string[];
  pattern: RegExp;
};

const SCHOOL_RULES: SchoolRule[] = [
  // Tibetan schools
  {
    slug: "nyingma",
    traditions: ["Tibetan"],
    pattern:
      /nyingma|palyul|dzogchen|drikung dzogchen|emaho|saraha|ati ling|chagdud|padma ling|longchen|nam cho|buddha dharma|buddha-dharma/i,
  },
  {
    slug: "kagyu",
    traditions: ["Tibetan"],
    pattern:
      /kagyu|karma thegsum|karma kagy|ktd\b|ktc\b|thegsum choling|drikung(?! dzogchen)|drigung|barom kagyu|kagyu changchub|kagyu droden|kagyu sukha|kagyu takten|karme ling|karmapa/i,
  },
  {
    slug: "gelug",
    traditions: ["Tibetan"],
    pattern:
      /gelug|ganden|sera je|seraje|drepung|tashi lh|tashi gomang|fpmt|liberation prison|jewel heart|guhyasamaja|tushita|gaden/i,
  },
  {
    slug: "sakya",
    traditions: ["Tibetan"],
    pattern: /sakya|sakyong|sakya phuntsok|sakya monastery/i,
  },
  { slug: "bon", traditions: ["Tibetan"], pattern: /\bbon\b|yungdrung bon|riwo sang/i },
  {
    slug: "shambhala",
    traditions: ["Tibetan", "Buddhist"],
    pattern: /shambhala/i,
  },
  {
    slug: "diamond-way",
    traditions: ["Tibetan"],
    pattern: /diamond way/i,
  },

  // Zen schools
  {
    slug: "soto",
    traditions: ["Zen"],
    pattern: /soto|sfzc|san francisco zen center|zen center of los angeles|zcla\b/i,
  },
  {
    slug: "rinzai",
    traditions: ["Zen"],
    pattern: /rinzai|ryugenji|daiyuzenji|korinji|rinzai-ji/i,
  },
  { slug: "obaku", traditions: ["Zen"], pattern: /obaku/i },
  {
    slug: "chan",
    traditions: ["Zen", "Chinese"],
    pattern:
      /chan (center|monastery|temple)|chung tai|dharma drum|ddmba|fo guang|foguang|dharma realm|city of ten thousand buddhas|cttb\b/i,
  },
  {
    slug: "son",
    traditions: ["Zen"],
    pattern: /\bson\b|kwan um|seung sahn|korean zen|bo hyun sa|hwagyesa|musangsa/i,
  },
  {
    slug: "thien",
    traditions: ["Zen", "Vietnamese"],
    pattern: /thien (that|tam|vien)|thien that|thien tam|thien vien/i,
  },
  {
    slug: "sanbo-zen",
    traditions: ["Zen"],
    pattern: /sanbo zen|san-un|san un/i,
  },
  {
    slug: "dharma-drum",
    traditions: ["Zen"],
    pattern: /dharma drum|ddmba/i,
  },

  // Theravada schools
  {
    slug: "vipassana",
    traditions: ["Theravada"],
    pattern: /vipassana|dhamma [a-z]|dhamma\b/i,
  },
  {
    slug: "insight",
    traditions: ["Theravada"],
    pattern: /insight (meditation|denver|community|retreat)|heart of the dharma/i,
  },
  {
    slug: "thai-forest",
    traditions: ["Theravada"],
    pattern: /forest monastery|wat metta|abhayagiri|amaravati/i,
  },

  // Southeast Asian national traditions
  {
    slug: "thai",
    traditions: ["Southeast Asian"],
    pattern: /thai|wat [a-z]|wat\b/i,
  },
  {
    slug: "burmese",
    traditions: ["Southeast Asian"],
    pattern: /burmese|chanmyay|myanmar|ဇေယျ/i,
  },
  { slug: "lao", traditions: ["Southeast Asian"], pattern: /\blao\b/i },
  {
    slug: "cambodian",
    traditions: ["Southeast Asian"],
    pattern: /cambodian|khmer|wat khmer/i,
  },
  {
    slug: "sri-lankan",
    traditions: ["Southeast Asian"],
    pattern: /sri lankan|sinhalese|sinhala/i,
  },

  // Pure Land schools
  {
    slug: "soka-gakkai",
    traditions: ["Pure Land"],
    pattern: /soka gakkai|sgi-usa|sgi usa|\bsgi\b|fncc\b/i,
  },
  {
    slug: "jodo-shin",
    traditions: ["Pure Land"],
    pattern: /jodo shin|shinshu|hongwanji|nishi hongwanji|higashi hongwanji|buddhist church of/i,
  },
  {
    slug: "jodo-shu",
    traditions: ["Pure Land"],
    pattern: /jodo shu|jodoshu|jōdo shū/i,
  },
];

export function schoolLabel(slug: string): string {
  return SCHOOL_LABELS[slug] ?? slug;
}

/** Infer schools from the place name only (folder names are too broad to use). */
export function inferSchools(place: Pick<Place, "name" | "tradition">): string[] {
  const schools = new Set<string>();

  for (const rule of SCHOOL_RULES) {
    if (!rule.traditions.includes(place.tradition)) continue;
    if (rule.pattern.test(place.name)) schools.add(rule.slug);
  }

  return [...schools].sort((a, b) => schoolLabel(a).localeCompare(schoolLabel(b)));
}

/** Manual schools from places.json merged with name-based inference. */
export function getSchools(place: Pick<Place, "name" | "tradition" | "schools">): string[] {
  const schools = new Set<string>(place.schools ?? []);

  for (const school of inferSchools(place)) {
    schools.add(school);
  }

  return [...schools].sort((a, b) => schoolLabel(a).localeCompare(schoolLabel(b)));
}

export function getSchoolsForPlaces(places: Place[]): string[] {
  const schools = new Set<string>();
  for (const place of places) {
    for (const school of getSchools(place)) schools.add(school);
  }
  return [...schools].sort((a, b) => schoolLabel(a).localeCompare(schoolLabel(b)));
}

export function getSchoolOptions(
  places: Place[],
  selectedTraditions: string[],
): { tradition: string; schools: string[] }[] {
  const scopedPlaces =
    selectedTraditions.length > 0
      ? places.filter((place) => selectedTraditions.includes(place.tradition))
      : places.filter((place) =>
          TRADITIONS_WITH_SCHOOLS.includes(
            place.tradition as (typeof TRADITIONS_WITH_SCHOOLS)[number],
          ),
        );

  const byTradition = new Map<string, Set<string>>();

  for (const place of scopedPlaces) {
    const schools = getSchools(place);
    if (schools.length === 0) continue;
    const set = byTradition.get(place.tradition) ?? new Set<string>();
    for (const school of schools) set.add(school);
    byTradition.set(place.tradition, set);
  }

  return TRADITIONS_WITH_SCHOOLS.filter((tradition) => byTradition.has(tradition)).map(
    (tradition) => ({
      tradition,
      schools: [...(byTradition.get(tradition) ?? [])].sort((a, b) =>
        schoolLabel(a).localeCompare(schoolLabel(b)),
      ),
    }),
  );
}
