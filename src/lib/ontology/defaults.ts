import type { OntologyNode, OntologySnapshot } from "@/types/ontology";
import { buildOntologySnapshot } from "./build-snapshot";

export const BUDDHIST_FILTER_ID = "Buddhist";
/** Default slug for the Buddhism node in seed data only — not special at runtime. */
export const DEFAULT_BUDDHISM_SLUG = "buddhist";

const LINEAGE_DEFS = [
  { slug: "tibetan", filterId: "Tibetan", label: "Tibetan", placeTraditions: ["Tibetan"] },
  { slug: "zen", filterId: "Zen", label: "Zen", placeTraditions: ["Zen", "Chinese", "Vietnamese"] },
  { slug: "theravada", filterId: "Theravada", label: "Theravada", placeTraditions: ["Theravada"] },
  {
    slug: "southeast-asian",
    filterId: "Southeast Asian",
    label: "Southeast Asian",
    placeTraditions: ["Southeast Asian"],
  },
  { slug: "pure-land", filterId: "Pure Land", label: "Pure Land", placeTraditions: ["Pure Land"] },
  { slug: "won", filterId: "Won Buddhism", label: "Won Buddhism", placeTraditions: ["Won Buddhism"] },
  { slug: "mahayana", filterId: "Mahayana", label: "Mahayana", placeTraditions: ["Mahayana"] },
] as const;

type SubschoolDef = {
  slug: string;
  label: string;
  lineage: string;
  placeTraditions: string[];
  pattern: string;
};

const SUBSCHOOL_DEFS: SubschoolDef[] = [
  {
    slug: "nyingma",
    label: "Nyingma",
    lineage: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: "nyingma|palyul|dzogchen|drikung dzogchen|emaho|saraha|ati ling|chagdud|padma ling|longchen|nam cho|buddha dharma|buddha-dharma",
  },
  {
    slug: "kagyu",
    label: "Kagyu",
    lineage: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern:
      "kagyu|karma thegsum|karma kagy|ktd\\b|ktc\\b|thegsum choling|drikung(?! dzogchen)|drigung|barom kagyu|kagyu changchub|kagyu droden|kagyu sukha|kagyu takten|karme ling|karmapa",
  },
  {
    slug: "gelug",
    label: "Gelug",
    lineage: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: "gelug|ganden|sera je|seraje|drepung|tashi lh|tashi gomang|fpmt|liberation prison|jewel heart|guhyasamaja|tushita|gaden",
  },
  {
    slug: "sakya",
    label: "Sakya",
    lineage: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: "sakya|sakyong|sakya phuntsok|sakya monastery",
  },
  {
    slug: "bon",
    label: "Bon",
    lineage: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: "\\bbon\\b|yungdrung bon|riwo sang",
  },
  {
    slug: "shambhala",
    label: "Shambhala",
    lineage: "tibetan",
    placeTraditions: ["Tibetan", "Buddhist"],
    pattern: "shambhala",
  },
  {
    slug: "diamond-way",
    label: "Diamond Way",
    lineage: "tibetan",
    placeTraditions: ["Tibetan"],
    pattern: "diamond way",
  },
  {
    slug: "soto",
    label: "Soto",
    lineage: "zen",
    placeTraditions: ["Zen"],
    pattern: "soto|sfzc|san francisco zen center|zen center of los angeles|zcla\\b",
  },
  {
    slug: "rinzai",
    label: "Rinzai",
    lineage: "zen",
    placeTraditions: ["Zen"],
    pattern: "rinzai|ryugenji|daiyuzenji|korinji|rinzai-ji",
  },
  {
    slug: "obaku",
    label: "Obaku",
    lineage: "zen",
    placeTraditions: ["Zen"],
    pattern: "obaku",
  },
  {
    slug: "chan",
    label: "Chan",
    lineage: "zen",
    placeTraditions: ["Zen", "Chinese"],
    pattern:
      "chan (center|monastery|temple)|chung tai|dharma drum|ddmba|fo guang|foguang|dharma realm|city of ten thousand buddhas|cttb\\b",
  },
  {
    slug: "son",
    label: "Son (Korean)",
    lineage: "zen",
    placeTraditions: ["Zen"],
    pattern: "\\bson\\b|kwan um|seung sahn|korean zen|bo hyun sa|hwagyesa|musangsa",
  },
  {
    slug: "thien",
    label: "Thiền (Vietnamese)",
    lineage: "zen",
    placeTraditions: ["Zen", "Vietnamese"],
    pattern: "thien (that|tam|vien)|thien that|thien tam|thien vien",
  },
  {
    slug: "sanbo-zen",
    label: "Sanbo Zen",
    lineage: "zen",
    placeTraditions: ["Zen"],
    pattern: "sanbo zen|san-un|san un",
  },
  {
    slug: "dharma-drum",
    label: "Dharma Drum",
    lineage: "zen",
    placeTraditions: ["Zen"],
    pattern: "dharma drum|ddmba",
  },
  {
    slug: "vipassana",
    label: "Vipassana",
    lineage: "theravada",
    placeTraditions: ["Theravada"],
    pattern: "vipassana|dhamma [a-z]|dhamma\\b",
  },
  {
    slug: "insight",
    label: "Insight Meditation",
    lineage: "theravada",
    placeTraditions: ["Theravada"],
    pattern: "insight (meditation|denver|community|retreat)|heart of the dharma",
  },
  {
    slug: "thai-forest",
    label: "Thai Forest",
    lineage: "theravada",
    placeTraditions: ["Theravada"],
    pattern: "thai forest|forest monastery|wat metta|abhayagiri|amaravati",
  },
  {
    slug: "thai",
    label: "Thai",
    lineage: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: "\\bthai(?! forest)\\b|wat [a-z]|wat\\b",
  },
  {
    slug: "burmese",
    label: "Burmese",
    lineage: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: "burmese|chanmyay|myanmar|ဇေယျ",
  },
  {
    slug: "lao",
    label: "Lao",
    lineage: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: "\\blao\\b",
  },
  {
    slug: "cambodian",
    label: "Cambodian",
    lineage: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: "cambodian|khmer|wat khmer",
  },
  {
    slug: "sri-lankan",
    label: "Sri Lankan",
    lineage: "southeast-asian",
    placeTraditions: ["Southeast Asian"],
    pattern: "sri lankan|sinhalese|sinhala",
  },
  {
    slug: "soka-gakkai",
    label: "Soka Gakkai",
    lineage: "pure-land",
    placeTraditions: ["Pure Land"],
    pattern: "soka gakkai|sgi-usa|sgi usa|\\bsgi\\b|fncc\\b",
  },
  {
    slug: "jodo-shin",
    label: "Jodo Shin",
    lineage: "pure-land",
    placeTraditions: ["Pure Land"],
    pattern: "jodo shin|shinshu|hongwanji|nishi hongwanji|higashi hongwanji|buddhist church of",
  },
  {
    slug: "jodo-shu",
    label: "Jodo Shu",
    lineage: "pure-land",
    placeTraditions: ["Pure Land"],
    pattern: "jodo shu|jodoshu|jōdo shū",
  },
];

const OTHER_TRADITION_DEFS = [
  { slug: "non-dualism", filterId: "Non-Dualism", label: "Non-Dualism" },
  { slug: "advaita-vedanta", filterId: "Advaita Vedanta", label: "Advaita Vedanta" },
  { slug: "sufi", filterId: "Sufi", label: "Sufi" },
  { slug: "contemplative-christian", filterId: "Contemplative Christian", label: "Contemplative Christian" },
  { slug: "hindu", filterId: "Hindu", label: "Hindu" },
] as const;

export function buildDefaultOntologyNodes(): OntologyNode[] {
  const nodes: OntologyNode[] = [
    {
      slug: DEFAULT_BUDDHISM_SLUG,
      label: "Buddhism",
      parentSlug: null,
      sortOrder: 0,
      nodeType: "tradition",
      filterId: BUDDHIST_FILTER_ID,
      placeTraditions: [],
      inferPattern: null,
      appliesToLocations: true,
      appliesToPeople: true,
    },
  ];

  LINEAGE_DEFS.forEach((lineage, index) => {
    nodes.push({
      slug: lineage.slug,
      label: lineage.label,
      parentSlug: DEFAULT_BUDDHISM_SLUG,
      sortOrder: index,
      nodeType: "lineage",
      filterId: lineage.filterId,
      placeTraditions: [...lineage.placeTraditions],
      inferPattern: null,
      appliesToLocations: true,
      appliesToPeople: true,
    });
  });

  SUBSCHOOL_DEFS.forEach((subschool, index) => {
    nodes.push({
      slug: subschool.slug,
      label: subschool.label,
      parentSlug: subschool.lineage,
      sortOrder: index,
      nodeType: "subschool",
      filterId: subschool.slug,
      placeTraditions: [...subschool.placeTraditions],
      inferPattern: subschool.pattern,
      appliesToLocations: true,
      appliesToPeople: true,
    });
  });

  OTHER_TRADITION_DEFS.forEach((tradition, index) => {
    nodes.push({
      slug: tradition.slug,
      label: tradition.label,
      parentSlug: null,
      sortOrder: index,
      nodeType: "tradition",
      filterId: tradition.filterId,
      placeTraditions: [],
      inferPattern: null,
      appliesToLocations: true,
      appliesToPeople: true,
    });
  });

  return nodes;
}

export function buildDefaultOntologySnapshot(): OntologySnapshot {
  return buildOntologySnapshot(buildDefaultOntologyNodes());
}

export const DEFAULT_ONTOLOGY_SNAPSHOT = buildDefaultOntologySnapshot();
