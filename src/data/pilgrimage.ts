import pilgrimageImages from "./pilgrimage-images.json";

export type PilgrimageKind = "site" | "route";

export type PilgrimageRegion =
  | "India & Nepal"
  | "Tibet & Himalaya"
  | "East Asia"
  | "Southeast Asia"
  | "Sri Lanka"
  | "West";

export type PilgrimageTradition =
  | "Buddhist"
  | "Theravada"
  | "Mahayana"
  | "Zen"
  | "Tibetan"
  | "Pure Land"
  | "Hindu"
  | "Interfaith";

export type PilgrimageSite = {
  slug: string;
  name: string;
  kind: "site";
  region: PilgrimageRegion;
  tradition: PilgrimageTradition;
  country: string;
  lat: number;
  lng: number;
  summary: string;
  significance: string;
  /** Official temple number on a numbered circuit (e.g. Shikoku henro). */
  templeNumber?: number;
};

export type PilgrimageRoute = {
  slug: string;
  name: string;
  kind: "route";
  region: PilgrimageRegion;
  tradition: PilgrimageTradition;
  summary: string;
  lengthNote: string;
  /** Longer guide copy shown on the route detail page. */
  significance?: string;
  /** Ordered site slugs; unknown stops are listed by name in `extraStops`. */
  stopSlugs: string[];
  extraStops?: string[];
};

/** Local hero image path from Wikimedia download (`npm run download-pilgrimage-photos`). */
export function getPilgrimageImage(slug: string): string | undefined {
  return (pilgrimageImages as Record<string, string>)[slug];
}

export type PilgrimageEntry = PilgrimageSite | PilgrimageRoute;

export const PILGRIMAGE_REGIONS: PilgrimageRegion[] = [
  "India & Nepal",
  "Tibet & Himalaya",
  "East Asia",
  "Southeast Asia",
  "Sri Lanka",
  "West"
];

export const PILGRIMAGE_TRADITIONS: PilgrimageTradition[] = [
  "Buddhist",
  "Theravada",
  "Mahayana",
  "Zen",
  "Tibetan",
  "Pure Land",
  "Hindu",
  "Interfaith"
];

export const PILGRIMAGE_SITES: PilgrimageSite[] = [
  {
    slug: "lumbini",
    name: "Lumbini",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Nepal",
    lat: 27.4833,
    lng: 83.2767,
    summary:
      "Birthplace of Siddhartha Gautama — the starting point of the Buddha’s life and of the classical pilgrimage circuit.",
    significance:
      "One of the four great sites named in the Mahāparinibbāna Sutta. Pilgrims visit the Maya Devi Temple and the surrounding monastic zone.",
  },
  {
    slug: "bodh-gaya",
    name: "Bodh Gaya",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 24.6951,
    lng: 84.9914,
    summary:
      "Site of the Buddha’s awakening under the Bodhi tree — the spiritual heart of Buddhist pilgrimage.",
    significance:
      "Home of the Mahabodhi Temple and an international monastic community spanning nearly every Buddhist tradition.",
  },
  {
    slug: "sarnath",
    name: "Sarnath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 25.3808,
    lng: 83.0214,
    summary:
      "Where the Buddha gave the first teaching (Dhammacakkappavattana) after awakening.",
    significance:
      "Deer Park and the Dhamek Stupa mark the turning of the wheel of Dharma; a core stop on the Indian Buddhist circuit.",
  },
  {
    slug: "kushinagar",
    name: "Kushinagar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 26.7406,
    lng: 83.8869,
    summary:
      "Place of the Buddha’s parinirvana — the final of the four great life sites.",
    significance:
      "Pilgrims visit the Mahaparinirvana Temple and Ramabhar Stupa, completing the classical life-circuit.",
  },
  {
    slug: "rajgir",
    name: "Rajgir",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 25.0265,
    lng: 85.4206,
    summary:
      "Ancient capital of Magadha and site of Vulture Peak, where many Mahayana sutras are set.",
    significance:
      "Linked to early councils, Gridhrakuta (Vulture Peak), and nearby Nalanda — a key stop beyond the four great sites.",
  },
  {
    slug: "shravasti",
    name: "Shravasti",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 27.5169,
    lng: 82.0506,
    summary:
      "Where the Buddha spent many rains retreats at Jetavana Monastery.",
    significance:
      "Among the eight great sites; associated with numerous discourses and the twin miracle traditions.",
  },
  {
    slug: "vaishali",
    name: "Vaishali",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 25.9902,
    lng: 85.1265,
    summary:
      "Licchavi republic city linked to early sangha history and the Buddha’s final journey north.",
    significance:
      "Remembered for the offering of the honey by a monkey, Ananda’s presence, and early stupa traditions.",
  },
  {
    slug: "nalanda",
    name: "Nalanda",
    kind: "site",
    region: "India & Nepal",
    tradition: "Mahayana",
    country: "India",
    lat: 25.1367,
    lng: 85.4439,
    summary:
      "Ruins of the great monastic university that shaped Mahayana and Vajrayana scholastic culture.",
    significance:
      "Pilgrims and students walk the excavated viharas as a living link to classical Buddhist learning.",
  },
  {
    slug: "sanchi",
    name: "Sanchi",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 23.4793,
    lng: 77.7396,
    summary:
      "Great Stupa complex begun under Ashoka — among the finest surviving early Buddhist monuments.",
    significance:
      "A pilgrimage and heritage site for the Ashokan spread of the Dharma across India.",
  },
  {
    slug: "anuradhapura",
    name: "Anuradhapura",
    kind: "site",
    region: "Sri Lanka",
    tradition: "Theravada",
    country: "Sri Lanka",
    lat: 8.3114,
    lng: 80.4037,
    summary:
      "Ancient Sri Lankan capital and heart of the Theravada monastic tradition.",
    significance:
      "Home of the Sri Maha Bodhi and vast dagobas; a cornerstone of the island’s sacred geography.",
  },
  {
    slug: "kandy-tooth-relic",
    name: "Temple of the Tooth (Kandy)",
    kind: "site",
    region: "Sri Lanka",
    tradition: "Theravada",
    country: "Sri Lanka",
    lat: 7.2936,
    lng: 80.6413,
    summary:
      "Sri Dalada Maligawa — guardian temple of the Buddha’s tooth relic.",
    significance:
      "Living royal-and-sangha pilgrimage center; the Esala Perahera draws devotees from across the island.",
  },
  {
    slug: "borobudur",
    name: "Borobudur",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Mahayana",
    country: "Indonesia",
    lat: -7.6079,
    lng: 110.2038,
    summary:
      "Monumental mandala temple in Java — walked as a three-dimensional path of awakening.",
    significance:
      "Pilgrims circumambulate ascending terraces from the realm of desire to the formless summit.",
  },
  {
    slug: "shwedagon",
    name: "Shwedagon Pagoda",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Myanmar",
    lat: 16.7983,
    lng: 96.1497,
    summary:
      "Golden stupa of Yangon said to enshrine relics of four Buddhas.",
    significance:
      "Myanmar’s preeminent Buddhist shrine and a continuous focus of lay devotion and pilgrimage.",
  },
  {
    slug: "angkor-wat",
    name: "Angkor Wat",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Hindu",
    country: "Cambodia",
    lat: 13.4125,
    lng: 103.867,
    summary:
      "Khmer temple-mountain later embraced as a Buddhist pilgrimage landscape.",
    significance:
      "Originally Hindu, now a living Theravada site within a vast sacred complex still walked by pilgrims.",
  },
  {
    slug: "jokhang",
    name: "Jokhang Temple",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "Tibet",
    lat: 29.653,
    lng: 91.132,
    summary:
      "Holiness of Lhasa — the Jokhang and Barkhor circuit at the center of Tibetan Buddhist devotion.",
    significance:
      "Pilgrims prostrate around the Barkhor; the Jowo Shakyamuni image is among Tibet’s most sacred.",
  },
  {
    slug: "mount-kailash",
    name: "Mount Kailash",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Interfaith",
    country: "Tibet",
    lat: 31.0669,
    lng: 81.3122,
    summary:
      "Axis mundi for Tibetan Buddhists, Bon, Hindus, and Jains — circled on a high-altitude kora.",
    significance:
      "A single mountain that gathers multiple sacred cosmologies into one demanding pilgrimage walk.",
  },
  {
    slug: "samye",
    name: "Samye Monastery",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "Tibet",
    lat: 29.325,
    lng: 91.503,
    summary:
      "Tibet’s first monastery — a mandala in architecture founded in the 8th century.",
    significance:
      "Linked to Padmasambhava, Shantarakshita, and the establishment of monastic Buddhism in Tibet.",
  },
  {
    slug: "koyasan",
    name: "Mount Kōya (Kōyasan)",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.2132,
    lng: 135.5835,
    summary:
      "Shingon mountain monastery founded by Kūkai — temple town, cemeteries, and forest paths.",
    significance:
      "Okunoin and the Danjo Garan form a classic Japanese esoteric pilgrimage destination.",
  },
  {
    slug: "kyoto-kinkaku",
    name: "Kyoto temple circuit",
    kind: "site",
    region: "East Asia",
    tradition: "Zen",
    country: "Japan",
    lat: 35.0394,
    lng: 135.7292,
    summary:
      "Cluster of Zen and Pure Land temples that form Japan’s most visited sacred cityscape.",
    significance:
      "Often walked as a multi-temple urban pilgrimage rather than a single shrine visit.",
  },
  {
    slug: "wutai-shan",
    name: "Wutai Shan",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 39.0792,
    lng: 113.565,
    summary:
      "One of China’s four sacred Buddhist mountains — abode of Manjushri.",
    significance:
      "A major East Asian pilgrimage range with temples spanning Chinese, Tibetan, and Mongol traditions.",
  },
  {
    slug: "putuo-shan",
    name: "Putuo Shan",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "China",
    lat: 29.985,
    lng: 122.384,
    summary:
      "Island mountain sacred to Avalokiteshvara (Guanyin) — one of China’s four famous Buddhist mountains.",
    significance:
      "Sea pilgrimage site where Chinese Pure Land and Guanyin devotion converge.",
  },
  {
    slug: "ryozen-ji",
    name: "Ryōzen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.1597,
    lng: 134.5019,
    templeNumber: 1,
    summary:
      "Temple 1 of the Shikoku henro — the traditional starting point in Tokushima Prefecture.",
    significance:
      "Pilgrims receive their first stamp (nōkyō) here and set out clockwise around the island in Kūkai’s footsteps.",
  },
  {
    slug: "shosan-ji",
    name: "Shōsan-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.9686,
    lng: 134.2083,
    templeNumber: 12,
    summary:
      "Temple 12 — a steep mountain temple and one of the hardest early climbs on the henro.",
    significance:
      "Often called a first true test of walking faith; fog, forest paths, and a high ridge reward the ascent.",
  },
  {
    slug: "hotsumisaki-ji",
    name: "Hotsumisaki-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.2486,
    lng: 134.1764,
    templeNumber: 24,
    summary:
      "Temple 24 at Cape Muroto — where legend places young Kūkai’s austere practice by the Pacific.",
    significance:
      "Marks the turn into Kōchi Prefecture’s long coastal stretch, among the loneliest walking days of the circuit.",
  },
  {
    slug: "kongofuku-ji",
    name: "Kongōfuku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 32.7333,
    lng: 133.0167,
    templeNumber: 38,
    summary:
      "Temple 38 at Cape Ashizuri — the southern tip of Shikoku and a dramatic ocean overlook.",
    significance:
      "A turning point of the henro: after Ashizuri, the path swings west and north toward Ehime.",
  },
  {
    slug: "ishite-ji",
    name: "Ishite-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.8478,
    lng: 132.7967,
    templeNumber: 51,
    summary:
      "Temple 51 in Matsuyama — famous Niō gate, treasure halls, and a classic henro landmark in Ehime.",
    significance:
      "A major urban temple stop where walkers and bus pilgrims alike gather mid-circuit.",
  },
  {
    slug: "zentsu-ji",
    name: "Zentsū-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.2256,
    lng: 133.7769,
    templeNumber: 75,
    summary:
      "Temple 75 — birthplace temple of Kūkai (Kōbō Daishi) and the spiritual heart of Kagawa’s henro.",
    significance:
      "One of the most important Shingon centers on the island; many pilgrims linger here longer than at ordinary stamps.",
  },
  {
    slug: "okubo-ji",
    name: "Ōkubo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.1917,
    lng: 134.2069,
    templeNumber: 88,
    summary:
      "Temple 88 — the traditional finish of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "Completing the circuit here, pilgrims often continue to Kōyasan on Honshu to report the journey to Kūkai’s mausoleum.",
  },
  {
    slug: "seiganto-ji",
    name: "Seiganto-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.6694,
    lng: 135.8898,
    templeNumber: 1,
    summary:
      "Temple 1 of the Saigoku Kannon pilgrimage — pagoda overlooking Nachi Falls in the Kumano mountains.",
    significance:
      "A rare surviving shrine-temple complex; also a key node of the UNESCO Kumano Kodō sacred landscape.",
  },
  {
    slug: "hase-dera",
    name: "Hase-dera (Nara)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.5359,
    lng: 135.9068,
    templeNumber: 8,
    summary:
      "Temple 8 of Saigoku — hill temple of Eleven-Faced Kannon above the ancient Yamato plain.",
    significance:
      "One of Japan’s great Kannon centers; long associated with imperial and aristocratic pilgrimage.",
  },
  {
    slug: "ishiyama-dera",
    name: "Ishiyama-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.9604,
    lng: 135.9056,
    templeNumber: 13,
    summary:
      "Temple 13 of Saigoku — Shingon temple on wollastonite cliffs above Lake Biwa’s southern shore.",
    significance:
      "Linked to literary pilgrimage (including Genji lore) as well as Kannon devotion.",
  },
  {
    slug: "kiyomizu-dera",
    name: "Kiyomizu-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.9948,
    lng: 135.785,
    templeNumber: 16,
    summary:
      "Temple 16 of Saigoku — Kyoto’s cliffside stage temple dedicated to Thousand-Armed Kannon.",
    significance:
      "Among the most visited Buddhist sites in Japan and a cornerstone of the Kansai Kannon circuit.",
  },
  {
    slug: "kumano-hongu",
    name: "Kumano Hongū Taisha",
    kind: "site",
    region: "East Asia",
    tradition: "Interfaith",
    country: "Japan",
    lat: 33.84,
    lng: 135.7739,
    summary:
      "Central grand shrine of Kumano — the spiritual hub where Kumano Kodō routes converge.",
    significance:
      "Head shrine of thousands of Kumano branch shrines; historically read through both Shinto and Buddhist eyes (honji suijaku).",
  },
  {
    slug: "kumano-nachi",
    name: "Kumano Nachi Taisha",
    kind: "site",
    region: "East Asia",
    tradition: "Interfaith",
    country: "Japan",
    lat: 33.6686,
    lng: 135.8906,
    summary:
      "Mountain shrine above Japan’s tallest waterfall, paired with Seiganto-ji in a single sacred precinct.",
    significance:
      "Nature worship, Shinto shrine, and Buddhist temple coexist here as a classic Kumano landscape.",
  },
  {
    slug: "kumano-hayatama",
    name: "Kumano Hayatama Taisha",
    kind: "site",
    region: "East Asia",
    tradition: "Interfaith",
    country: "Japan",
    lat: 33.7339,
    lng: 135.9936,
    summary:
      "Coastal grand shrine at Shingū — one of the three Kumano Sanzan destinations.",
    significance:
      "Often reached by river from Hongū in classical itineraries; closes the Kumano triangle with Nachi and Hongū.",
  },
  {
    slug: "lake-manasarovar",
    name: "Lake Manasarovar",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Interfaith",
    country: "Tibet",
    lat: 30.653,
    lng: 81.469,
    summary:
      "Sacred high-altitude lake beside Mount Kailash — ritual bathing and kora ground for multiple faiths.",
    significance:
      "Paired with Kailash in Buddhist, Hindu, Bon, and Jain cosmologies; many pilgrims visit both on one journey.",
  },
  {
    slug: "emei-shan",
    name: "Emei Shan",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 29.5208,
    lng: 103.3325,
    summary:
      "One of China’s four sacred Buddhist mountains — abode of Samantabhadra (Puxian).",
    significance:
      "A vast temple-mountain range in Sichuan, climbed as both pilgrimage and scenic ascent to the Golden Summit.",
  },
  {
    slug: "jiuhua-shan",
    name: "Jiuhua Shan",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 30.4825,
    lng: 117.8058,
    summary:
      "One of China’s four sacred Buddhist mountains — associated with Kṣitigarbha (Dizang).",
    significance:
      "Famous for mountain monasteries and rites for the dead; a major East Asian Dizang pilgrimage center.",
  },
  {
    slug: "sri-pada",
    name: "Sri Pada (Adam’s Peak)",
    kind: "site",
    region: "Sri Lanka",
    tradition: "Interfaith",
    country: "Sri Lanka",
    lat: 6.8096,
    lng: 80.4994,
    summary:
      "Cone-shaped peak climbed by night for a sacred footprint — Buddhist, Hindu, Muslim, and Christian traditions meet here.",
    significance:
      "Sri Lankan Buddhists honor the Buddha’s footprint; other communities read the same summit through their own sacred stories.",
  },
  {
    slug: "polonnaruwa",
    name: "Polonnaruwa",
    kind: "site",
    region: "Sri Lanka",
    tradition: "Theravada",
    country: "Sri Lanka",
    lat: 7.9396,
    lng: 81.0188,
    summary:
      "Medieval capital of Sri Lanka with vast dagobas, palace ruins, and the Gal Vihara Buddha images.",
    significance:
      "A core stop on the Cultural Triangle pilgrimage between Anuradhapura and Kandy.",
  },
  {
    slug: "swayambhunath",
    name: "Swayambhunath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Nepal",
    lat: 27.7149,
    lng: 85.2906,
    summary:
      "The “Monkey Temple” — hilltop stupa watching over the Kathmandu Valley.",
    significance:
      "One of the oldest and most important Buddhist sites in Nepal, shared in practice with local Hindu devotion.",
  },
  {
    slug: "boudhanath",
    name: "Boudhanath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Tibetan",
    country: "Nepal",
    lat: 27.7215,
    lng: 85.362,
    summary:
      "Enormous mandala stupa and living Tibetan Buddhist neighborhood in Kathmandu.",
    significance:
      "A primary kora site for Himalayan Buddhists in exile and a daily circuit of prayer wheels and butter lamps.",
  },
  {
    slug: "bagan",
    name: "Bagan",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Myanmar",
    lat: 21.1717,
    lng: 94.8603,
    summary:
      "Plain of thousands of brick temples and stupas — Myanmar’s great Buddhist archaeological landscape.",
    significance:
      "Pilgrims and travelers move temple to temple across the ancient capital’s sacred field.",
  },
  {
    slug: "mahamuni",
    name: "Mahamuni Buddha Temple",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Myanmar",
    lat: 21.9519,
    lng: 96.0789,
    summary:
      "Mandalay’s most sacred Buddha image — continuously anointed with gold leaf by devotees.",
    significance:
      "A living national pilgrimage focus of Upper Myanmar, complementary to Yangon’s Shwedagon.",
  },
  {
    slug: "potala",
    name: "Potala Palace",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "Tibet",
    lat: 29.6555,
    lng: 91.1175,
    summary:
      "Winter palace of the Dalai Lamas and iconic fortress-temple above Lhasa.",
    significance:
      "Political and spiritual landmark of the Gelug world; still a powerful stop on Lhasa pilgrimage circuits.",
  },
  {
    slug: "drepung",
    name: "Drepung Monastery",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "Tibet",
    lat: 29.6764,
    lng: 91.0478,
    summary:
      "Once the largest monastery in Tibet — a major Gelug learning seat west of Lhasa.",
    significance:
      "Paired with Sera and Ganden in classical Lhasa monastic pilgrimage.",
  },
  {
    slug: "sera",
    name: "Sera Monastery",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "Tibet",
    lat: 29.6981,
    lng: 91.1347,
    summary:
      "Great Gelug monastery famous for courtyard debate and hillside hermitages.",
    significance:
      "A standard stop on the Lhasa sacred circuit alongside the Jokhang, Potala, and Drepung.",
  },
  {
    slug: "mount-haguro",
    name: "Mount Haguro",
    kind: "site",
    region: "East Asia",
    tradition: "Interfaith",
    country: "Japan",
    lat: 38.7025,
    lng: 139.9836,
    summary:
      "Most accessible of the Three Mountains of Dewa — cedar stair pilgrimage of Shugendō practice.",
    significance:
      "Represents birth in the Dewa Sanzan triad; still walked by yamabushi and lay pilgrims alike.",
  },
  {
    slug: "mount-gassan",
    name: "Mount Gassan",
    kind: "site",
    region: "East Asia",
    tradition: "Interfaith",
    country: "Japan",
    lat: 38.5489,
    lng: 140.0267,
    summary:
      "Highest of the Dewa three — alpine shrine mountain opened seasonally to pilgrims.",
    significance:
      "Represents death in the Dewa cosmology; climbed as the middle term of the rebirth circuit.",
  },
  {
    slug: "mount-yudono",
    name: "Mount Yudono",
    kind: "site",
    region: "East Asia",
    tradition: "Interfaith",
    country: "Japan",
    lat: 38.5283,
    lng: 139.9917,
    summary:
      "Most sacred and restricted of the Dewa mountains — hot-spring rock shrine of rebirth.",
    significance:
      "Traditionally the final mountain of the Dewa Sanzan pilgrimage; photography is often forbidden at the sanctum.",
  },
  {
    slug: "shimabuji",
    name: "Shimabu-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0273,
    lng: 139.1207,
    templeNumber: 1,
    summary:
      "Temple 1 of the Chichibu 34 Kannon pilgrimage — the usual starting point in Saitama’s Chichibu basin.",
    significance:
      "Marks the beginning of Japan’s shortest major Kannon circuit, often completed over a few days of walking.",
  },
  {
    slug: "suisenji",
    name: "Suisen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0818,
    lng: 139.0538,
    templeNumber: 34,
    summary:
      "Temple 34 of Chichibu — the final fudasho of the 34-temple Kannon circuit.",
    significance:
      "Completing Chichibu finishes the eastern third of the Japan 100 Kannon pilgrimage (with Saigoku and Bandō).",
  },
  {
    slug: "sugimoto-dera",
    name: "Sugimoto-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.3226,
    lng: 139.5674,
    templeNumber: 1,
    summary:
      "Temple 1 of the Bandō 33 Kannon pilgrimage — ancient cliffside temple in Kamakura.",
    significance:
      "One of Kamakura’s oldest temples and the traditional eastern start of the Kantō Kannon circuit.",
  },
  {
    slug: "senso-ji",
    name: "Sensō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.7147,
    lng: 139.7968,
    templeNumber: 13,
    summary:
      "Temple 13 of Bandō — Tokyo’s oldest temple, reached through the Thunder Gate and Nakamise street.",
    significance:
      "The great urban Kannon stop of the Kantō circuit; millions of visitors fold tourism and devotion together here.",
  },
  {
    slug: "nago-ji",
    name: "Nago-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.0256,
    lng: 139.8579,
    templeNumber: 33,
    summary:
      "Temple 33 of Bandō — forested hillside temple in Tateyama, Chiba, and the circuit’s traditional finish.",
    significance:
      "Pilgrims receive final stamps here; many then continue to Chichibu to complete the Japan 100 Kannon.",
  },
  {
    slug: "jison-in",
    name: "Jison-in",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.2952,
    lng: 135.5502,
    summary:
      "Temple at the foot of the Chōishi-michi — traditional gateway path up to Mount Kōya.",
    significance:
      "Associated with Kūkai’s mother in Shingon lore; stone stupa-markers (chōishi) begin the climb toward the mountain monastery.",
  },
  {
    slug: "tongdosa",
    name: "Tongdosa",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "South Korea",
    lat: 35.4881,
    lng: 129.0647,
    summary:
      "Korea’s Buddha Jewel Temple — vast monastic complex enshrining relics of the Buddha.",
    significance:
      "One of the Three Jewel Temples (Sambosa); UNESCO-listed Sansa mountain monastery and Korea’s largest temple compound.",
  },
  {
    slug: "haeinsa",
    name: "Haeinsa",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "South Korea",
    lat: 35.8014,
    lng: 128.0978,
    summary:
      "Korea’s Dharma Jewel Temple — guardian of the Tripitaka Koreana woodblocks on Gayasan.",
    significance:
      "The Janggyeong Panjeon depositories are UNESCO World Heritage; the canon itself is Memory of the World.",
  },
  {
    slug: "songgwangsa",
    name: "Songgwangsa",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "South Korea",
    lat: 35.0028,
    lng: 127.2694,
    summary:
      "Korea’s Sangha Jewel Temple — historic seat of Seon practice founded in the spirit of Jinul.",
    significance:
      "Famous for producing national teachers and sustaining intensive meditation retreats; the living sangha is its sacred claim.",
  },
  {
    slug: "ayutthaya",
    name: "Ayutthaya",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 14.3692,
    lng: 100.588,
    summary:
      "Ruined Siamese capital of towering prangs and reclining Buddhas — a national pilgrimage landscape near Bangkok.",
    significance:
      "Wat Mahathat, Wat Phra Si Sanphet, and neighboring wats form a walking field of Theravada memory.",
  },
  {
    slug: "sukhothai",
    name: "Sukhothai",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 17.019,
    lng: 99.703,
    summary:
      "First capital of the Thai kingdom — parkland of lotus ponds, Buddha images, and classic Sukhothai-style temples.",
    significance:
      "Often paired with Si Satchanalai; a foundational Theravada royal-and-sangha landscape of northern Thailand.",
  },
  {
    slug: "doi-suthep",
    name: "Wat Phra That Doi Suthep",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 18.8047,
    lng: 98.9215,
    summary:
      "Golden mountain wat above Chiang Mai — northern Thailand’s most famous living pilgrimage temple.",
    significance:
      "Reached by serpentine road or stairs; the chedi is a focus of Lanna Buddhist devotion and national pilgrimage.",
  },
  {
    slug: "goka-do",
    name: "Goka-dō",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9988,
    lng: 139.106,
    templeNumber: 5,
    summary:
      "Temple 5 of the Chichibu 34 Kannon pilgrimage.",
    significance:
      "An early urban fudasho on the compact Chichibu Kannon circuit in Saitama.",
  },
  {
    slug: "akechi-ji",
    name: "Akechi-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9841,
    lng: 139.1028,
    templeNumber: 9,
    summary:
      "Temple 9 of the Chichibu 34 Kannon pilgrimage.",
    significance:
      "Mid-basin stop on the Chichibu walking circuit of neighborhood Kannon halls.",
  },
  {
    slug: "jigen-ji",
    name: "Jigen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9924,
    lng: 139.0827,
    templeNumber: 13,
    summary:
      "Temple 13 of the Chichibu 34 Kannon pilgrimage.",
    significance:
      "Halfway marker for many walkers completing Chichibu over several days.",
  },
  {
    slug: "godo-ji",
    name: "Gōdo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.01,
    lng: 139.0924,
    templeNumber: 18,
    summary:
      "Temple 18 of the Chichibu 34 Kannon pilgrimage.",
    significance:
      "One of the denser mid-circuit clusters in the Chichibu valley.",
  },
  {
    slug: "doji-do",
    name: "Dōji-dō",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0073,
    lng: 139.0732,
    templeNumber: 22,
    summary:
      "Temple 22 of the Chichibu 34 Kannon pilgrimage.",
    significance:
      "Later-circuit fudasho as the path swings through Chichibu’s western neighborhoods.",
  },
  {
    slug: "enyu-ji",
    name: "En’yū-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9725,
    lng: 139.073,
    templeNumber: 26,
    summary:
      "Temple 26 of the Chichibu 34 Kannon pilgrimage.",
    significance:
      "Approaches the more rural western stretch of the Chichibu Kannon route.",
  },
  {
    slug: "houn-ji",
    name: "Hōun-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9513,
    lng: 138.9914,
    templeNumber: 30,
    summary:
      "Temple 30 of the Chichibu 34 Kannon pilgrimage.",
    significance:
      "Near-final temple before walkers climb toward Suisen-ji, Temple 34.",
  },
  {
    slug: "shofuku-ji",
    name: "Shōfuku-ji (Kanagawa)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.28,
    lng: 139.1643,
    templeNumber: 5,
    summary:
      "Temple 5 of the Bandō 33 Kannon pilgrimage in Kanagawa.",
    significance:
      "Early Kantō Kannon stop west of Kamakura on the Bandō circuit.",
  },
  {
    slug: "jiko-ji",
    name: "Jikō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0109,
    lng: 139.2299,
    templeNumber: 9,
    summary:
      "Temple 9 of the Bandō 33 Kannon pilgrimage in Saitama.",
    significance:
      "Northern swing of the Bandō route before pilgrims enter Tokyo.",
  },
  {
    slug: "mangan-ji",
    name: "Mangan-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.4755,
    lng: 139.5893,
    templeNumber: 17,
    summary:
      "Temple 17 of the Bandō 33 Kannon pilgrimage in Tochigi.",
    significance:
      "Mountain-edge Kannon temple on the northern arc of the Kantō circuit.",
  },
  {
    slug: "nichirin-ji",
    name: "Nichirin-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.9212,
    lng: 140.2737,
    templeNumber: 21,
    summary:
      "Temple 21 of the Bandō 33 Kannon pilgrimage in Ibaraki.",
    significance:
      "Northeastern Bandō stop as the circuit turns back toward the Pacific.",
  },
  {
    slug: "omi-do",
    name: "Ōmi-dō",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.2126,
    lng: 140.0994,
    templeNumber: 25,
    summary:
      "Temple 25 of the Bandō 33 Kannon pilgrimage.",
    significance:
      "Later Ibaraki-area fudasho on the eastern Bandō loop.",
  },
  {
    slug: "chiba-dera",
    name: "Chiba-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.5951,
    lng: 140.1317,
    templeNumber: 29,
    summary:
      "Temple 29 of the Bandō 33 Kannon pilgrimage in Chiba.",
    significance:
      "Approaching the finish; pilgrims continue south to Nago-ji on the Bōsō Peninsula.",
  },
  {
    slug: "kokawa-dera",
    name: "Kokawa-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.281,
    lng: 135.4059,
    templeNumber: 3,
    summary:
      "Temple 3 of the Saigoku Kannon pilgrimage in Wakayama.",
    significance:
      "Early Kansai Kannon stop after Seiganto-ji on the classical western circuit.",
  },
  {
    slug: "minamihokke-ji",
    name: "Minamihokke-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.4264,
    lng: 135.8099,
    templeNumber: 6,
    summary:
      "Temple 6 of the Saigoku Kannon pilgrimage in Nara Prefecture.",
    significance:
      "Southern Yamato Kannon temple on the climb toward the Nara–Kyoto cluster.",
  },
  {
    slug: "mimuroto-ji",
    name: "Mimuroto-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.9005,
    lng: 135.8192,
    templeNumber: 10,
    summary:
      "Temple 10 of Saigoku — hillside flower temple above Uji.",
    significance:
      "Famous for azaleas and hydrangeas as well as Kannon devotion on the Kansai circuit.",
  },
  {
    slug: "mii-dera",
    name: "Mii-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.0134,
    lng: 135.8529,
    templeNumber: 14,
    summary:
      "Temple 14 of Saigoku — Onjō-ji, great temple overlooking Lake Biwa at Ōtsu.",
    significance:
      "Historic Tendai rival center to Enryaku-ji and a major Biwa-shore Kannon stop.",
  },
  {
    slug: "choho-ji",
    name: "Chōhō-ji (Rokkaku-dō)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.0072,
    lng: 135.7603,
    templeNumber: 18,
    summary:
      "Temple 18 of Saigoku — hexagonal hall in central Kyoto.",
    significance:
      "Urban Kyoto Kannon temple, traditionally linked to the origins of ikebana.",
  },
  {
    slug: "soji-ji-ibaraki",
    name: "Sōji-ji (Ibaraki)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.8291,
    lng: 135.5816,
    templeNumber: 22,
    summary:
      "Temple 22 of the Saigoku Kannon pilgrimage in Osaka Prefecture.",
    significance:
      "Western Kansai Kannon stop as the circuit moves toward Hyōgo.",
  },
  {
    slug: "ichijo-ji",
    name: "Ichijō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.8593,
    lng: 134.819,
    templeNumber: 26,
    summary:
      "Temple 26 of Saigoku — mountain temple above Kasai in Hyōgo.",
    significance:
      "Steep approach temple on the western stretch of the Saigoku route.",
  },
  {
    slug: "hogon-ji",
    name: "Hōgon-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.4211,
    lng: 136.1432,
    templeNumber: 30,
    summary:
      "Temple 30 of Saigoku — island temple on Chikubu-shima in Lake Biwa.",
    significance:
      "Boat-access Kannon island shrine-temple near the end of the western circuit.",
  },
  {
    slug: "kegon-ji",
    name: "Kegon-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.5374,
    lng: 136.6079,
    templeNumber: 33,
    summary:
      "Temple 33 of Saigoku — traditional finish of the Kansai Kannon pilgrimage in Gifu.",
    significance:
      "Completing Saigoku here, many pilgrims later add Bandō and Chichibu for the Japan 100 Kannon.",
  },
  {
    slug: "yakuo-ji",
    name: "Yakuō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.7728,
    lng: 134.5931,
    templeNumber: 23,
    summary:
      "Temple 23 — cliffside yakushi temple in Minami, Tokushima, marking the turn into Kōchi.",
    significance:
      "Famous for its steep staircase and as a hinge between Tokushima and the long Kōchi coast.",
  },
  {
    slug: "chikurin-ji",
    name: "Chikurin-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.5466,
    lng: 133.5775,
    templeNumber: 31,
    summary:
      "Temple 31 on Godaisan above Kōchi City — a green hill temple mid-coast.",
    significance:
      "Major urban-adjacent henro stop in Kōchi Prefecture with a renowned garden and museum.",
  },
  {
    slug: "unpen-ji",
    name: "Unpen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.0394,
    lng: 133.722,
    templeNumber: 66,
    summary:
      "Temple 66 — the highest temple on the Shikoku henro, straddling Tokushima and Kagawa.",
    significance:
      "Often reached by ropeway; a dramatic highland threshold into the final prefecture.",
  },
  {
    slug: "yashima-ji",
    name: "Yashima-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.359,
    lng: 134.108,
    templeNumber: 84,
    summary:
      "Temple 84 on the Yashima plateau above Takamatsu.",
    significance:
      "Near-final Kagawa temple with battlefield views before pilgrims finish at Ōkubo-ji.",
  },
  {
    slug: "dirapuk",
    name: "Dirapuk",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Interfaith",
    country: "Tibet",
    lat: 31.099,
    lng: 81.311,
    summary:
      "North-face kora camp below Kailash — first major overnight on the standard three-day circuit.",
    significance:
      "Closest camp to the mountain’s sheer north face; acclimatization and prayer stop for most walking pilgrims.",
  },
  {
    slug: "zutulpuk",
    name: "Zutulpuk",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Interfaith",
    country: "Tibet",
    lat: 30.997,
    lng: 81.424,
    summary:
      "East-side kora camp after the Dolma La pass — final overnight before closing the circuit.",
    significance:
      "Named for a cave associated with Milarepa; the last shelter before pilgrims return toward Darchen.",
  },
  {
    slug: "namo-buddha",
    name: "Namo Buddha",
    kind: "site",
    region: "India & Nepal",
    tradition: "Tibetan",
    country: "Nepal",
    lat: 27.572,
    lng: 85.578,
    summary:
      "Hilltop monastery southeast of Kathmandu — site of the Buddha’s legendary body-offering jātaka.",
    significance:
      "A major day pilgrimage from the valley; Thrangu monastery anchors contemporary Tibetan practice here.",
  },
  {
    slug: "golden-temple-patan",
    name: "Golden Temple (Patan)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Nepal",
    lat: 27.6734,
    lng: 85.325,
    summary:
      "Hiranya Varna Mahavihar — Newar Buddhist courtyard monastery in Patan’s old city.",
    significance:
      "Living Newar sangha temple and a core stop on Kathmandu Valley Buddhist walks.",
  },
  {
    slug: "mihintale",
    name: "Mihintale",
    kind: "site",
    region: "Sri Lanka",
    tradition: "Theravada",
    country: "Sri Lanka",
    lat: 8.35,
    lng: 80.516,
    summary:
      "Mountain monastery where Buddhism was traditionally introduced to Sri Lanka.",
    significance:
      "Paired with Anuradhapura; pilgrims climb stairs to shrines marking Mahinda’s meeting with King Devanampiya Tissa.",
  },
  {
    slug: "dambulla",
    name: "Dambulla Cave Temple",
    kind: "site",
    region: "Sri Lanka",
    tradition: "Theravada",
    country: "Sri Lanka",
    lat: 7.8567,
    lng: 80.6492,
    summary:
      "Rock-cave vihara with centuries of Buddha images — a Cultural Triangle pilgrimage essential.",
    significance:
      "UNESCO site between Habarana and the ancient capitals; often combined with Sigiriya on the same journey.",
  },
  {
    slug: "nallathanniya",
    name: "Nallathanniya",
    kind: "site",
    region: "Sri Lanka",
    tradition: "Interfaith",
    country: "Sri Lanka",
    lat: 6.812,
    lng: 80.521,
    summary:
      "Main trailhead village for the Sri Pada night ascent.",
    significance:
      "Most pilgrims begin the torchlight climb here, reaching the summit for sunrise.",
  },
  {
    slug: "wat-phra-kaew",
    name: "Wat Phra Kaew",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 13.751,
    lng: 100.4927,
    summary:
      "Temple of the Emerald Buddha within Bangkok’s Grand Palace — Thailand’s preeminent royal wat.",
    significance:
      "National pilgrimage focus and ceremonial heart of Thai Buddhism in the modern capital.",
  },
  {
    slug: "si-satchanalai",
    name: "Si Satchanalai",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 17.431,
    lng: 99.786,
    summary:
      "Companion historic city to Sukhothai — riverside ruins of wats and chedis in parkland.",
    significance:
      "Usually visited with Sukhothai as one UNESCO historic-town pilgrimage.",
  },
  {
    slug: "kyaiktiyo",
    name: "Kyaiktiyo (Golden Rock)",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Myanmar",
    lat: 17.481,
    lng: 97.098,
    summary:
      "Gravity-defying gilded boulder pagoda — one of Myanmar’s most famous pilgrimage wonders.",
    significance:
      "Reached by open-truck and final climb; especially thronged around full-moon observances.",
  },
  {
    slug: "sagaing",
    name: "Sagaing Hills",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Myanmar",
    lat: 21.878,
    lng: 95.979,
    summary:
      "Hill of monasteries and nunneries across the river from Mandalay.",
    significance:
      "A living meditation landscape often combined with Mahamuni and Amarapura on Upper Myanmar pilgrimages.",
  },
  {
    slug: "sankassa",
    name: "Sankassa (Sankisa)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 27.3339,
    lng: 79.2711,
    summary:
      "One of the Eight Great Places — where tradition says the Buddha descended from Trāyastriṃśa heaven.",
    significance:
      "Completes the classical Attha-mahathanani with Lumbini, Bodh Gaya, Sarnath, Kushinagar, Rajgir, Vaishali, and Shravasti.",
  },
  {
    slug: "ajanta",
    name: "Ajanta Caves",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 20.5533,
    lng: 75.7003,
    summary:
      "Rock-cut Buddhist cave monasteries and painted chaityas overlooking a horseshoe gorge in Maharashtra.",
    significance:
      "UNESCO masterpiece of early Buddhist art (2nd century BCE–5th century CE), with narrative murals of Jātaka tales still vivid today.",
  },
  {
    slug: "ellora",
    name: "Ellora Caves",
    kind: "site",
    region: "India & Nepal",
    tradition: "Interfaith",
    country: "India",
    lat: 20.0268,
    lng: 75.1771,
    summary:
      "Monumental cave temples of Buddhism, Hinduism, and Jainism carved from a single basalt cliff.",
    significance:
      "Includes the colossal Kailasa temple (Cave 16) — one of the world’s greatest rock-cut Hindu monuments — beside Buddhist and Jain viharas.",
  },
  {
    slug: "elephanta",
    name: "Elephanta Caves",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 18.9633,
    lng: 72.9314,
    summary:
      "Island cave temple in Mumbai harbour dedicated to Shiva, famous for the Trimurti sculpture.",
    significance:
      "UNESCO rock-cut sanctuary embodying Shaiva cosmology at India’s western gateway.",
  },
  {
    slug: "amaravati",
    name: "Amaravati Stupa",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 16.5753,
    lng: 80.358,
    summary:
      "Great Andhra stupa site on the Krishna River — once among the largest Buddhist monuments in India.",
    significance:
      "Source of the celebrated Amaravati school of sculpture; a key Deccan center of early Buddhist devotion.",
  },
  {
    slug: "nagarjunakonda",
    name: "Nagarjunakonda",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 16.5219,
    lng: 79.2429,
    summary:
      "Island archaeological park of stupas and monasteries from a major Ikshvaku-era Buddhist university city.",
    significance:
      "Named for the Madhyamaka master Nāgārjuna in later memory; one of South India’s richest excavated Buddhist landscapes.",
  },
  {
    slug: "vikramshila",
    name: "Vikramashila",
    kind: "site",
    region: "India & Nepal",
    tradition: "Mahayana",
    country: "India",
    lat: 25.3244,
    lng: 87.285,
    summary:
      "Ruins of a great Pala-era mahavihara in Bihar, peer to Nalanda as a medieval university.",
    significance:
      "A leading center of Vajrayana learning before the 12th–13th century destructions; today an excavated brick monastic complex.",
  },
  {
    slug: "kapilavastu",
    name: "Kapilavastu (Tilaurakot)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Nepal",
    lat: 27.58,
    lng: 83.08,
    summary:
      "Likely capital of the Shakya republic — the city of Prince Siddhartha’s youth near Lumbini.",
    significance:
      "Tilaurakot’s fortified mound is the leading archaeological candidate for Kapilavastu on the Buddha’s early life map.",
  },
  {
    slug: "varanasi",
    name: "Varanasi (Kashi Vishwanath)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 25.3108,
    lng: 83.0106,
    summary:
      "One of Hinduism’s oldest living sacred cities — ghats of the Ganga and the Jyotirlinga of Kashi Vishwanath.",
    significance:
      "Sapta Puri city of liberation; continuous pilgrimage for millennia and a spiritual capital of Shaivism and Hindu learning.",
  },
  {
    slug: "kedarnath",
    name: "Kedarnath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.7352,
    lng: 79.0669,
    summary:
      "High Himalayan Jyotirlinga temple of Shiva — a cornerstone of the Chota Char Dham.",
    significance:
      "Reached by steep mountain pilgrimage; among the most revered Shaiva shrines in India.",
  },
  {
    slug: "badrinath",
    name: "Badrinath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.7447,
    lng: 79.4912,
    summary:
      "Northern Char Dham temple of Vishnu in the Garhwal Himalaya.",
    significance:
      "Established in the classical pan-Indian Char Dham circuit attributed to Adi Shankara.",
  },
  {
    slug: "rameswaram",
    name: "Rameswaram",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 9.2881,
    lng: 79.3173,
    summary:
      "Island temple of Ramanathaswamy — southern Char Dham and Jyotirlinga on the tip of India.",
    significance:
      "Linked to the Ramayana’s Setu crossing; one of Hinduism’s great southern pilgrimage destinations.",
  },
  {
    slug: "dwarka",
    name: "Dwarka",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 22.2379,
    lng: 68.9676,
    summary:
      "Western Char Dham city of Krishna — Dwarkadhish Temple on the Arabian Sea.",
    significance:
      "Sapta Puri and Char Dham site recalling Krishna’s legendary capital.",
  },
  {
    slug: "jagannath-puri",
    name: "Jagannath Temple, Puri",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.8047,
    lng: 85.8183,
    summary:
      "Eastern Char Dham temple of Jagannath — famous for the annual Rath Yatra.",
    significance:
      "One of Hinduism’s most important Vaishnava shrines and a living festival pilgrimage of national scale.",
  },
  {
    slug: "tirupati",
    name: "Tirumala Venkateswara",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 13.6833,
    lng: 79.3472,
    summary:
      "Hill temple of Venkateswara — among the world’s most visited Hindu shrines.",
    significance:
      "Called Kaliyuga Vaikuntha by devotees; a continuous South Indian Vaishnava pilgrimage of immense scale.",
  },
  {
    slug: "mathura",
    name: "Mathura (Krishna Janmasthan)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 27.5047,
    lng: 77.6698,
    summary:
      "Birthplace city of Krishna — Sapta Puri pilgrimage heart of Braj.",
    significance:
      "Paired with Vrindavan as the landscape of Krishna’s childhood and the Bhakti movement.",
  },
  {
    slug: "haridwar",
    name: "Haridwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 29.945,
    lng: 78.163,
    summary:
      "Gateway city where the Ganga enters the plains — Sapta Puri and Kumbh Mela site.",
    significance:
      "Har Ki Pauri and evening Ganga Aarti draw continuous Hindu pilgrimage; one of the four Kumbh cities.",
  },
  {
    slug: "meenakshi-madurai",
    name: "Meenakshi Temple, Madurai",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 9.9197,
    lng: 78.1194,
    summary:
      "Dravidian temple city of Meenakshi and Sundareswarar — South India’s architectural pilgrimage icon.",
    significance:
      "A living Shaiva–Shakta complex with towering gopurams anchoring Tamil sacred geography.",
  },
  {
    slug: "konark",
    name: "Konark Sun Temple",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.8875,
    lng: 86.0947,
    summary:
      "13th-century chariot temple of Surya on the Odisha coast — UNESCO World Heritage.",
    significance:
      "Apex of Kalinga temple architecture; often paired with nearby Puri on eastern Hindu pilgrimages.",
  },
  {
    slug: "khajuraho",
    name: "Khajuraho Temples",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 24.8544,
    lng: 79.9214,
    summary:
      "Chandela-era temple group famed for sculpture — Hindu and Jain sanctuaries in Madhya Pradesh.",
    significance:
      "UNESCO ensemble of medieval North Indian temple art and Tantric–Puranic iconography.",
  },
  {
    slug: "amarnath",
    name: "Amarnath Cave",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 34.2149,
    lng: 75.5008,
    summary:
      "High Himalayan ice-lingam cave of Shiva — among Kashmir’s great seasonal pilgrimages.",
    significance:
      "The Amarnath Yatra is one of India’s most arduous living mountain pilgrimages.",
  },
  {
    slug: "pashupatinath",
    name: "Pashupatinath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "Nepal",
    lat: 27.7097,
    lng: 85.3486,
    summary:
      "Nepal’s foremost Shiva temple on the Bagmati — a UNESCO Kathmandu Valley shrine.",
    significance:
      "National Shaiva pilgrimage center; often visited with the valley’s great Buddhist stupas.",
  },
  {
    slug: "taxila",
    name: "Taxila",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Pakistan",
    lat: 33.7458,
    lng: 72.7875,
    summary:
      "Ancient Gandharan university city of stupas, monasteries, and Indo-Greek Buddhist art.",
    significance:
      "UNESCO landscape where Hellenistic and Indian cultures shaped early Mahayana imagery.",
  },
  {
    slug: "takht-i-bahi",
    name: "Takht-i-Bahi",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Pakistan",
    lat: 34.2861,
    lng: 71.9467,
    summary:
      "Hilltop monastic complex — among the best-preserved Gandharan Buddhist ruins.",
    significance:
      "UNESCO World Heritage monastery illustrating the monastic plan of northwest Buddhist India.",
  },
  {
    slug: "leshan-buddha",
    name: "Leshan Giant Buddha",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 29.5447,
    lng: 103.7733,
    summary:
      "71-meter cliff-carved Buddha at the confluence of rivers near Mount Emei.",
    significance:
      "Largest pre-modern stone Buddha; UNESCO twin with Emei Shan as a Chinese Buddhist landmark.",
  },
  {
    slug: "mogao-caves",
    name: "Mogao Caves (Dunhuang)",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 40.0372,
    lng: 94.8042,
    summary:
      "Thousand Buddha Caves on the Silk Road — painted grottoes of a millennium of Buddhist art.",
    significance:
      "UNESCO archive of manuscripts and murals linking Central Asian, Indian, and Chinese Buddhism.",
  },
  {
    slug: "yungang",
    name: "Yungang Grottoes",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 40.1105,
    lng: 113.1259,
    summary:
      "Northern Wei cliff Buddhas near Datong — early imperial Chinese Buddhist sculpture.",
    significance:
      "UNESCO caves that mark Buddhism’s first monumental flourishing under a Chinese dynasty.",
  },
  {
    slug: "longmen",
    name: "Longmen Grottoes",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 34.5556,
    lng: 112.4697,
    summary:
      "Yi River cliff temples near Luoyang with tens of thousands of carved Buddhas.",
    significance:
      "UNESCO peak of Tang Buddhist stone carving and imperial patronage.",
  },
  {
    slug: "white-horse-temple",
    name: "White Horse Temple",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 34.7239,
    lng: 112.5997,
    summary:
      "Traditionally China’s first Buddhist temple, founded in the Eastern Han near Luoyang.",
    significance:
      "Foundational site in the Chinese reception of Buddhism from the Western Regions.",
  },
  {
    slug: "shaolin",
    name: "Shaolin Monastery",
    kind: "site",
    region: "East Asia",
    tradition: "Zen",
    country: "China",
    lat: 34.5081,
    lng: 112.9354,
    summary:
      "Songshan monastery famed as a cradle of Chan (Zen) and Chinese martial tradition.",
    significance:
      "Living Chan pilgrimage site combining temple halls, pagoda forest, and mountain practice.",
  },
  {
    slug: "big-wild-goose",
    name: "Giant Wild Goose Pagoda",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "China",
    lat: 34.2198,
    lng: 108.9594,
    summary:
      "Tang pagoda in Xi’an built for Xuanzang’s Sanskrit scriptures from India.",
    significance:
      "Icon of the Silk Road translation project that reshaped Chinese Buddhism.",
  },
  {
    slug: "todai-ji",
    name: "Tōdai-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.6892,
    lng: 135.8397,
    summary:
      "Nara’s Great Buddha Hall — among the largest wooden buildings and bronze Buddhas in the world.",
    significance:
      "State Buddhism landmark of the 8th century; still a living pilgrimage temple in Nara Park.",
  },
  {
    slug: "horyu-ji",
    name: "Hōryū-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.6144,
    lng: 135.7342,
    summary:
      "Among the world’s oldest surviving wooden temple buildings, founded in the Asuka period.",
    significance:
      "UNESCO site preserving the earliest layer of Japanese Buddhist architecture and iconography.",
  },
  {
    slug: "enryaku-ji",
    name: "Enryaku-ji (Mount Hiei)",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 35.0706,
    lng: 135.8411,
    summary:
      "Tendai headquarters above Kyoto — mother mountain of many Japanese Buddhist schools.",
    significance:
      "From Saichō’s foundation onward, Hiei shaped Pure Land, Zen, and Nichiren lineages alike.",
  },
  {
    slug: "byodo-in",
    name: "Byōdō-in",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.8894,
    lng: 135.8078,
    summary:
      "Phoenix Hall Amida temple in Uji — the Pure Land aesthetic of the Heian aristocracy.",
    significance:
      "UNESCO World Heritage icon of Amida devotion, famous worldwide from Japan’s ¥10 coin.",
  },
  {
    slug: "bulguksa",
    name: "Bulguksa",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "South Korea",
    lat: 35.79,
    lng: 129.3322,
    summary:
      "Silla masterpiece temple below Seokguram — Korea’s most celebrated Buddhist complex.",
    significance:
      "UNESCO pair with Seokguram; architectural summit of Unified Silla Buddhism.",
  },
  {
    slug: "seokguram",
    name: "Seokguram Grotto",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "South Korea",
    lat: 35.795,
    lng: 129.3492,
    summary:
      "Granite cave shrine with a serene seated Buddha overlooking the East Sea.",
    significance:
      "UNESCO pinnacle of Korean Buddhist sculpture, traditionally linked with Bulguksa below.",
  },
  {
    slug: "that-luang",
    name: "Pha That Luang",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Laos",
    lat: 17.9762,
    lng: 102.6343,
    summary:
      "Golden national stupa of Laos in Vientiane — emblem of Lao Buddhist identity.",
    significance:
      "Legendary relic stupa and the country’s foremost Theravada pilgrimage monument.",
  },
  {
    slug: "wat-xieng-thong",
    name: "Wat Xieng Thong",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Laos",
    lat: 19.8975,
    lng: 102.1431,
    summary:
      "Jewel of Luang Prabang’s royal temple architecture on the Mekong confluence.",
    significance:
      "UNESCO town shrine embodying Lan Xang Buddhist art and Lao royal ceremony.",
  },
  {
    slug: "prambanan",
    name: "Prambanan",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Hindu",
    country: "Indonesia",
    lat: -7.7522,
    lng: 110.4917,
    summary:
      "9th-century Hindu temple compound of Shiva, Vishnu, and Brahma on the Java plain.",
    significance:
      "UNESCO twin landscape with nearby Buddhist Borobudur — Java’s Hindu–Buddhist sacred axis.",
  },
  {
    slug: "mendut",
    name: "Mendut Temple",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Mahayana",
    country: "Indonesia",
    lat: -7.6044,
    lng: 110.2294,
    summary:
      "Stone Mahayana temple near Borobudur with a great seated Buddha triad.",
    significance:
      "Processional partner to Borobudur; pilgrims traditionally visit Mendut before climbing the great stupa.",
  },
  {
    slug: "phra-pathom",
    name: "Phra Pathom Chedi",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 13.8197,
    lng: 100.0603,
    summary:
      "Massive white chedi in Nakhon Pathom — among the world’s tallest Buddhist stupas.",
    significance:
      "Traditional first stupa of Siam; a foundational Theravada monument west of Bangkok.",
  },
  {
    slug: "wat-pho",
    name: "Wat Pho",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 13.7464,
    lng: 100.4936,
    summary:
      "Temple of the Reclining Buddha beside Bangkok’s Grand Palace.",
    significance:
      "Living Bangkok pilgrimage and historic seat of Thai traditional medicine education.",
  },
  {
    slug: "wat-arun",
    name: "Wat Arun",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Theravada",
    country: "Thailand",
    lat: 13.7436,
    lng: 100.4889,
    summary:
      "Porcelain-clad Temple of Dawn on the Chao Phraya opposite the Grand Palace.",
    significance:
      "Bangkok riverside landmark of Theravada devotion and royal ceremony.",
  },
  {
    slug: "bayon",
    name: "Bayon",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Buddhist",
    country: "Cambodia",
    lat: 13.4411,
    lng: 103.8586,
    summary:
      "State temple of Angkor Thom with the famous smiling face-towers of Jayavarman VII.",
    significance:
      "Mahayana imperial monument at the political heart of the Angkorian Buddhist capital.",
  },
  {
    slug: "my-son",
    name: "Mỹ Sơn",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Hindu",
    country: "Vietnam",
    lat: 15.7667,
    lng: 108.1167,
    summary:
      "Cham Hindu temple towers in a sacred valley of central Vietnam.",
    significance:
      "UNESCO remnant of Indianized Cham Shaivism — Southeast Asia’s Hindu architectural frontier.",
  },
  {
    slug: "perfume-pagoda",
    name: "Perfume Pagoda (Hương Temple)",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Mahayana",
    country: "Vietnam",
    lat: 20.62,
    lng: 105.75,
    summary:
      "Mountain cave shrine complex southwest of Hanoi — Vietnam’s great seasonal Buddhist pilgrimage.",
    significance:
      "Boat-and-climb pilgrimage through limestone hills to the Huong Tich cave shrine.",
  },
  {
    slug: "kek-lok-si",
    name: "Kek Lok Si",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Mahayana",
    country: "Malaysia",
    lat: 5.3995,
    lng: 100.2737,
    summary:
      "Largest Buddhist temple in Malaysia — hill complex above George Town, Penang.",
    significance:
      "Major Chinese Mahayana pilgrimage and diaspora Buddhist landmark of maritime Southeast Asia.",
  },
  {
    slug: "batu-caves",
    name: "Batu Caves",
    kind: "site",
    region: "Southeast Asia",
    tradition: "Hindu",
    country: "Malaysia",
    lat: 3.2374,
    lng: 101.6839,
    summary:
      "Limestone cave temple of Murugan with the great golden statue and 272-step climb.",
    significance:
      "Focal Malaysian Hindu pilgrimage, especially during Thaipusam.",
  },
  {
    slug: "tashilhunpo",
    name: "Tashilhunpo Monastery",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "Tibet",
    lat: 29.2686,
    lng: 88.8699,
    summary:
      "Panchen Lama’s great monastery in Shigatse — western Tibet’s monastic capital.",
    significance:
      "Gelug power seat and major kora landscape on the Lhasa–Nepal pilgrimage corridor.",
  },
  {
    slug: "ganden",
    name: "Ganden Monastery",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "Tibet",
    lat: 29.758,
    lng: 91.475,
    summary:
      "Tsongkhapa’s mother monastery of the Gelug school above the Kyi Chu valley.",
    significance:
      "One of the three great Gelug seats with Drepung and Sera; a classic day pilgrimage from Lhasa.",
  },
  {
    slug: "hemis",
    name: "Hemis Monastery",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "India",
    lat: 33.9125,
    lng: 77.7028,
    summary:
      "Largest and wealthiest monastery of Ladakh — Drukpa Kagyu seat in a high desert gorge.",
    significance:
      "Famous for the Hemis Festival; a living Himalayan Buddhist pilgrimage in the Indian Trans-Himalaya.",
  },
  {
    slug: "erdene-zuu",
    name: "Erdene Zuu Monastery",
    kind: "site",
    region: "East Asia",
    tradition: "Tibetan",
    country: "Mongolia",
    lat: 47.2017,
    lng: 102.8433,
    summary:
      "Mongolia’s earliest surviving Buddhist monastery, built from Karakorum’s stones.",
    significance:
      "UNESCO Orkhon Valley shrine marking the Mongol conversion to Tibetan Buddhism.",
  },
  {
    slug: "gandan",
    name: "Gandantegchinlen Monastery",
    kind: "site",
    region: "East Asia",
    tradition: "Tibetan",
    country: "Mongolia",
    lat: 47.9231,
    lng: 106.895,
    summary:
      "Ulaanbaatar’s great living monastery — heart of Mongolian Buddhist revival.",
    significance:
      "National pilgrimage center with the towering Migjid Janraisig Avalokiteśvara statue.",
  },
  {
    slug: "gokuraku-ji",
    name: "Gokuraku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.156,
    lng: 134.49,
    templeNumber: 2,
    summary:
      "Temple 2 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "konsen-ji",
    name: "Konsen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.147,
    lng: 134.469,
    templeNumber: 3,
    summary:
      "Temple 3 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-dainichi-ji-4",
    name: "Dainichi-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.151,
    lng: 134.431,
    templeNumber: 4,
    summary:
      "Temple 4 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "jizo-ji",
    name: "Jizo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.137,
    lng: 134.432,
    templeNumber: 5,
    summary:
      "Temple 5 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-anraku-ji-6",
    name: "Anraku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.118,
    lng: 134.388,
    templeNumber: 6,
    summary:
      "Temple 6 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "juraku-ji",
    name: "Juraku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.121,
    lng: 134.378,
    templeNumber: 7,
    summary:
      "Temple 7 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "kumadani-ji",
    name: "Kumadani-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.123,
    lng: 134.34,
    templeNumber: 8,
    summary:
      "Temple 8 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "horin-ji",
    name: "Horin-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.104,
    lng: 134.334,
    templeNumber: 9,
    summary:
      "Temple 9 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "kirihata-ji",
    name: "Kirihata-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.108,
    lng: 134.304,
    templeNumber: 10,
    summary:
      "Temple 10 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-fujii-dera-11",
    name: "Fujii-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.052,
    lng: 134.349,
    templeNumber: 11,
    summary:
      "Temple 11 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-dainichi-ji-13",
    name: "Dainichi-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.038,
    lng: 134.463,
    templeNumber: 13,
    summary:
      "Temple 13 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-joraku-ji-14",
    name: "Joraku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.05,
    lng: 134.476,
    templeNumber: 14,
    summary:
      "Temple 14 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "awa-kokubun-ji",
    name: "Awa Kokubun-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.056,
    lng: 134.474,
    templeNumber: 15,
    summary:
      "Temple 15 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-kannon-ji-16",
    name: "Kannon-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.068,
    lng: 134.474,
    templeNumber: 16,
    summary:
      "Temple 16 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "ido-ji",
    name: "Ido-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.085,
    lng: 134.485,
    templeNumber: 17,
    summary:
      "Temple 17 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "onzan-ji",
    name: "Onzan-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.986,
    lng: 134.578,
    templeNumber: 18,
    summary:
      "Temple 18 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "tatsue-ji",
    name: "Tatsue-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.968,
    lng: 134.606,
    templeNumber: 19,
    summary:
      "Temple 19 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "kakurin-ji",
    name: "Kakurin-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.914,
    lng: 134.506,
    templeNumber: 20,
    summary:
      "Temple 20 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "tairyu-ji",
    name: "Tairyu-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.883,
    lng: 134.522,
    templeNumber: 21,
    summary:
      "Temple 21 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "byodo-ji",
    name: "Byodo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.852,
    lng: 134.583,
    templeNumber: 22,
    summary:
      "Temple 22 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shinsho-ji",
    name: "Shinsho-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.288,
    lng: 134.148,
    templeNumber: 25,
    summary:
      "Temple 25 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "kongocho-ji",
    name: "Kongocho-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.307,
    lng: 134.123,
    templeNumber: 26,
    summary:
      "Temple 26 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "konomine-ji",
    name: "Konomine-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.468,
    lng: 133.975,
    templeNumber: 27,
    summary:
      "Temple 27 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-dainichi-ji-28",
    name: "Dainichi-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.578,
    lng: 133.705,
    templeNumber: 28,
    summary:
      "Temple 28 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "tosa-kokubun-ji",
    name: "Tosa Kokubun-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.599,
    lng: 133.64,
    templeNumber: 29,
    summary:
      "Temple 29 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "zenraku-ji",
    name: "Zenraku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.592,
    lng: 133.578,
    templeNumber: 30,
    summary:
      "Temple 30 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "zenjibu-ji",
    name: "Zenjibu-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.527,
    lng: 133.611,
    templeNumber: 32,
    summary:
      "Temple 32 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "sekkei-ji",
    name: "Sekkei-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.501,
    lng: 133.543,
    templeNumber: 33,
    summary:
      "Temple 33 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "tanema-ji",
    name: "Tanema-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.492,
    lng: 133.488,
    templeNumber: 34,
    summary:
      "Temple 34 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-kiyotaki-ji-35",
    name: "Kiyotaki-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.513,
    lng: 133.41,
    templeNumber: 35,
    summary:
      "Temple 35 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shoryu-ji",
    name: "Shoryu-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.426,
    lng: 133.451,
    templeNumber: 36,
    summary:
      "Temple 36 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "iwamoto-ji",
    name: "Iwamoto-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.208,
    lng: 133.135,
    templeNumber: 37,
    summary:
      "Temple 37 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "enko-ji",
    name: "Enko-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 32.961,
    lng: 132.774,
    templeNumber: 39,
    summary:
      "Temple 39 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "kanjizai-ji",
    name: "Kanjizai-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 32.965,
    lng: 132.564,
    templeNumber: 40,
    summary:
      "Temple 40 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "ryuko-ji",
    name: "Ryuko-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.295,
    lng: 132.599,
    templeNumber: 41,
    summary:
      "Temple 41 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "butsumoku-ji",
    name: "Butsumoku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.311,
    lng: 132.581,
    templeNumber: 42,
    summary:
      "Temple 42 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "meiseki-ji",
    name: "Meiseki-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.369,
    lng: 132.519,
    templeNumber: 43,
    summary:
      "Temple 43 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "daiho-ji",
    name: "Daiho-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.661,
    lng: 132.912,
    templeNumber: 44,
    summary:
      "Temple 44 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "iwaya-ji",
    name: "Iwaya-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.659,
    lng: 132.981,
    templeNumber: 45,
    summary:
      "Temple 45 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "joruri-ji",
    name: "Joruri-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.754,
    lng: 132.819,
    templeNumber: 46,
    summary:
      "Temple 46 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "yasaka-ji",
    name: "Yasaka-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.758,
    lng: 132.813,
    templeNumber: 47,
    summary:
      "Temple 47 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "sairin-ji",
    name: "Sairin-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.794,
    lng: 132.814,
    templeNumber: 48,
    summary:
      "Temple 48 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "jodo-ji",
    name: "Jodo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.817,
    lng: 132.809,
    templeNumber: 49,
    summary:
      "Temple 49 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "hanta-ji",
    name: "Hanta-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.828,
    lng: 132.805,
    templeNumber: 50,
    summary:
      "Temple 50 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-taisan-ji-52",
    name: "Taisan-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.885,
    lng: 132.715,
    templeNumber: 52,
    summary:
      "Temple 52 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "enmyo-ji",
    name: "Enmyo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.892,
    lng: 132.74,
    templeNumber: 53,
    summary:
      "Temple 53 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "enmei-ji",
    name: "Enmei-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.067,
    lng: 132.964,
    templeNumber: 54,
    summary:
      "Temple 54 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "nankobo",
    name: "Nankobo",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.069,
    lng: 132.996,
    templeNumber: 55,
    summary:
      "Temple 55 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-taisan-ji-56",
    name: "Taisan-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.05,
    lng: 132.975,
    templeNumber: 56,
    summary:
      "Temple 56 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "eifuku-ji",
    name: "Eifuku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.029,
    lng: 132.978,
    templeNumber: 57,
    summary:
      "Temple 57 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "senyu-ji",
    name: "Senyu-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.013,
    lng: 132.977,
    templeNumber: 58,
    summary:
      "Temple 58 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "iyo-kokubun-ji",
    name: "Iyo Kokubun-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.026,
    lng: 133.025,
    templeNumber: 59,
    summary:
      "Temple 59 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "yokomine-ji",
    name: "Yokomine-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.838,
    lng: 133.111,
    templeNumber: 60,
    summary:
      "Temple 60 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "koon-ji",
    name: "Koon-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.894,
    lng: 133.103,
    templeNumber: 61,
    summary:
      "Temple 61 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "hoju-ji",
    name: "Hoju-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.897,
    lng: 133.115,
    templeNumber: 62,
    summary:
      "Temple 62 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "kichijo-ji",
    name: "Kichijo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.896,
    lng: 133.129,
    templeNumber: 63,
    summary:
      "Temple 63 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "maegami-ji",
    name: "Maegami-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.89,
    lng: 133.161,
    templeNumber: 64,
    summary:
      "Temple 64 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "sankaku-ji",
    name: "Sankaku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 33.968,
    lng: 133.587,
    templeNumber: 65,
    summary:
      "Temple 65 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "daiko-ji",
    name: "Daiko-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.102,
    lng: 133.719,
    templeNumber: 67,
    summary:
      "Temple 67 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "jinne-in",
    name: "Jinne-in",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.134,
    lng: 133.647,
    templeNumber: 68,
    summary:
      "Temple 68 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shikoku-kannon-ji-69",
    name: "Kannon-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.135,
    lng: 133.648,
    templeNumber: 69,
    summary:
      "Temple 69 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "motoyama-ji",
    name: "Motoyama-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.14,
    lng: 133.694,
    templeNumber: 70,
    summary:
      "Temple 70 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "iyadani-ji",
    name: "Iyadani-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.23,
    lng: 133.724,
    templeNumber: 71,
    summary:
      "Temple 71 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "mandara-ji",
    name: "Mandara-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.223,
    lng: 133.75,
    templeNumber: 72,
    summary:
      "Temple 72 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shusshaka-ji",
    name: "Shusshaka-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.219,
    lng: 133.75,
    templeNumber: 73,
    summary:
      "Temple 73 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "koyama-ji",
    name: "Koyama-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.233,
    lng: 133.766,
    templeNumber: 74,
    summary:
      "Temple 74 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "konzo-ji",
    name: "Konzo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.25,
    lng: 133.781,
    templeNumber: 76,
    summary:
      "Temple 76 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "doryu-ji",
    name: "Doryu-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.277,
    lng: 133.763,
    templeNumber: 77,
    summary:
      "Temple 77 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "gosho-ji",
    name: "Gosho-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.307,
    lng: 133.825,
    templeNumber: 78,
    summary:
      "Temple 78 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "tenno-ji",
    name: "Tenno-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.311,
    lng: 133.883,
    templeNumber: 79,
    summary:
      "Temple 79 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "sanuki-kokubun-ji",
    name: "Sanuki Kokubun-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.303,
    lng: 133.944,
    templeNumber: 80,
    summary:
      "Temple 80 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shiromine-ji",
    name: "Shiromine-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.334,
    lng: 133.927,
    templeNumber: 81,
    summary:
      "Temple 81 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "negoro-ji",
    name: "Negoro-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.345,
    lng: 133.961,
    templeNumber: 82,
    summary:
      "Temple 82 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "ichinomiya-ji",
    name: "Ichinomiya-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.287,
    lng: 134.027,
    templeNumber: 83,
    summary:
      "Temple 83 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "yakuri-ji",
    name: "Yakuri-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.36,
    lng: 134.14,
    templeNumber: 85,
    summary:
      "Temple 85 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "shido-ji",
    name: "Shido-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.324,
    lng: 134.18,
    templeNumber: 86,
    summary:
      "Temple 86 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "nagao-ji",
    name: "Nagao-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Mahayana",
    country: "Japan",
    lat: 34.267,
    lng: 134.172,
    templeNumber: 87,
    summary:
      "Temple 87 of the Shikoku 88 Temple Pilgrimage.",
    significance:
      "An official fudasho on the Shikoku 88 Temple Pilgrimage circuit.",
  },
  {
    slug: "kimii-dera",
    name: "Kimii-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.1852,
    lng: 135.19,
    templeNumber: 2,
    summary:
      "Temple 2 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "sefuku-ji",
    name: "Sefuku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.3929,
    lng: 135.5116,
    templeNumber: 4,
    summary:
      "Temple 4 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "saigoku-fujii-dera-5",
    name: "Fujii-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.5702,
    lng: 135.5966,
    templeNumber: 5,
    summary:
      "Temple 5 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "oka-dera",
    name: "Oka-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.4718,
    lng: 135.8284,
    templeNumber: 7,
    summary:
      "Temple 7 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "nanendo",
    name: "Nan'endō (Kōfuku-ji)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.6825,
    lng: 135.8303,
    templeNumber: 9,
    summary:
      "Temple 9 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kami-daigo-ji",
    name: "Kami Daigo-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.951,
    lng: 135.8196,
    templeNumber: 11,
    summary:
      "Temple 11 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "shoho-ji-iwama",
    name: "Shōhō-ji (Iwama-dera)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.933,
    lng: 135.8784,
    templeNumber: 12,
    summary:
      "Temple 12 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "imakumano-kannon-ji",
    name: "Imakumano Kannon-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.9797,
    lng: 135.7808,
    templeNumber: 15,
    summary:
      "Temple 15 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "rokuharamitsu-ji",
    name: "Rokuharamitsu-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.9971,
    lng: 135.7733,
    templeNumber: 17,
    summary:
      "Temple 17 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "gyogan-ji",
    name: "Gyōgan-ji (Kōdō)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.0163,
    lng: 135.7678,
    templeNumber: 19,
    summary:
      "Temple 19 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "yoshimine-dera",
    name: "Yoshimine-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.9382,
    lng: 135.6442,
    templeNumber: 20,
    summary:
      "Temple 20 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "anao-ji",
    name: "Anao-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.0067,
    lng: 135.5492,
    templeNumber: 21,
    summary:
      "Temple 21 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "katsuo-ji",
    name: "Katsuō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.8658,
    lng: 135.4911,
    templeNumber: 23,
    summary:
      "Temple 23 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "nakayama-dera",
    name: "Nakayama-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.8217,
    lng: 135.3677,
    templeNumber: 24,
    summary:
      "Temple 24 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kiyomizu-dera-hyogo",
    name: "Kiyomizu-dera (Hyōgo)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.9725,
    lng: 135.0818,
    templeNumber: 25,
    summary:
      "Temple 25 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "engyo-ji",
    name: "Engyō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 34.8911,
    lng: 134.6581,
    templeNumber: 27,
    summary:
      "Temple 27 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "nariai-ji",
    name: "Nariai-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.5954,
    lng: 135.1874,
    templeNumber: 28,
    summary:
      "Temple 28 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "matsunoo-dera",
    name: "Matsunoo-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.4974,
    lng: 135.4694,
    templeNumber: 29,
    summary:
      "Temple 29 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "chomei-ji",
    name: "Chōmei-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.1627,
    lng: 136.064,
    templeNumber: 31,
    summary:
      "Temple 31 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kannonsho-ji",
    name: "Kannonshō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.1447,
    lng: 136.161,
    templeNumber: 32,
    summary:
      "Temple 32 of the Saigoku 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Saigoku 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "shimpuku-ji",
    name: "Shimpuku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0145,
    lng: 139.1312,
    templeNumber: 2,
    summary:
      "Temple 2 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "josen-ji",
    name: "Jōsen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0119,
    lng: 139.1066,
    templeNumber: 3,
    summary:
      "Temple 3 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kinsho-ji",
    name: "Kinshō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0066,
    lng: 139.1135,
    templeNumber: 4,
    summary:
      "Temple 4 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "bokuun-ji",
    name: "Boku'un-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9837,
    lng: 139.1142,
    templeNumber: 6,
    summary:
      "Temple 6 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "hocho-ji",
    name: "Hōchō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9838,
    lng: 139.1079,
    templeNumber: 7,
    summary:
      "Temple 7 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "saizen-ji",
    name: "Saizen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9731,
    lng: 139.1087,
    templeNumber: 8,
    summary:
      "Temple 8 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "daiji-ji",
    name: "Daiji-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9972,
    lng: 139.0957,
    templeNumber: 10,
    summary:
      "Temple 10 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "chichibu-joraku-ji-11",
    name: "Jōraku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9934,
    lng: 139.0908,
    templeNumber: 11,
    summary:
      "Temple 11 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "nosaka-ji",
    name: "Nosaka-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9834,
    lng: 139.0856,
    templeNumber: 12,
    summary:
      "Temple 12 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "imamiya-bo",
    name: "Imamiya-bō",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9951,
    lng: 139.0786,
    templeNumber: 14,
    summary:
      "Temple 14 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "shorin-ji",
    name: "Shōrin-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9952,
    lng: 139.0853,
    templeNumber: 15,
    summary:
      "Temple 15 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "saiko-ji",
    name: "Saikō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0006,
    lng: 139.0775,
    templeNumber: 16,
    summary:
      "Temple 16 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "jorin-ji",
    name: "Jōrin-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0057,
    lng: 139.0842,
    templeNumber: 17,
    summary:
      "Temple 17 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "ryuseki-ji",
    name: "Ryūseki-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0175,
    lng: 139.0892,
    templeNumber: 19,
    summary:
      "Temple 19 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "iwanoue-do",
    name: "Iwanoue-dō",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0174,
    lng: 139.0845,
    templeNumber: 20,
    summary:
      "Temple 20 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "chichibu-kannon-ji-21",
    name: "Kannon-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0159,
    lng: 139.0779,
    templeNumber: 21,
    summary:
      "Temple 21 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "ongaku-ji",
    name: "Ongaku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.006,
    lng: 139.0621,
    templeNumber: 23,
    summary:
      "Temple 23 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "hosen-ji",
    name: "Hōsen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9875,
    lng: 139.061,
    templeNumber: 24,
    summary:
      "Temple 24 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kyusho-ji",
    name: "Kyūshō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9716,
    lng: 139.0488,
    templeNumber: 25,
    summary:
      "Temple 25 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "daien-ji",
    name: "Daien-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9677,
    lng: 139.0668,
    templeNumber: 27,
    summary:
      "Temple 27 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "hashidate-do",
    name: "Hashidate-dō",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9605,
    lng: 139.061,
    templeNumber: 28,
    summary:
      "Temple 28 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "chosen-in",
    name: "Chōsen-in",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9603,
    lng: 139.05,
    templeNumber: 29,
    summary:
      "Temple 29 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kannon-in",
    name: "Kannon-in",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0411,
    lng: 138.9539,
    templeNumber: 31,
    summary:
      "Temple 31 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "hosho-ji",
    name: "Hōshō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9966,
    lng: 139.0129,
    templeNumber: 32,
    summary:
      "Temple 32 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kikusui-ji",
    name: "Kikusui-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0309,
    lng: 139.0423,
    templeNumber: 33,
    summary:
      "Temple 33 of the Chichibu 34 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Chichibu 34 Kannon Pilgrimage circuit.",
  },
  {
    slug: "ganden-ji",
    name: "Ganden-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.3051,
    lng: 139.5723,
    templeNumber: 2,
    summary:
      "Temple 2 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "anyo-in",
    name: "An'yō-in",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.3142,
    lng: 139.5553,
    templeNumber: 3,
    summary:
      "Temple 3 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "hase-dera-kamakura",
    name: "Hase-dera (Kamakura)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.3125,
    lng: 139.5331,
    templeNumber: 4,
    summary:
      "Temple 4 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "chokoku-ji-atsugi",
    name: "Chōkoku-ji (Iiyama)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.4716,
    lng: 139.3038,
    templeNumber: 6,
    summary:
      "Temple 6 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "komyo-ji",
    name: "Kōmyō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.3588,
    lng: 139.2888,
    templeNumber: 7,
    summary:
      "Temple 7 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "shokoku-ji",
    name: "Shōkoku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.4849,
    lng: 139.3989,
    templeNumber: 8,
    summary:
      "Temple 8 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "shobo-ji",
    name: "Shōbō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0014,
    lng: 139.3624,
    templeNumber: 10,
    summary:
      "Temple 10 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "bando-anraku-ji-11",
    name: "Anraku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.0543,
    lng: 139.4383,
    templeNumber: 11,
    summary:
      "Temple 11 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "jion-ji",
    name: "Jion-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.9794,
    lng: 139.7108,
    templeNumber: 12,
    summary:
      "Temple 12 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "gumyo-ji",
    name: "Gumyō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.4242,
    lng: 139.5974,
    templeNumber: 14,
    summary:
      "Temple 14 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "chokoku-ji-gunma",
    name: "Chōkoku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.3853,
    lng: 138.9326,
    templeNumber: 15,
    summary:
      "Temple 15 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "mizusawa-dera",
    name: "Mizusawa-dera",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.4793,
    lng: 138.9453,
    templeNumber: 16,
    summary:
      "Temple 16 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "chuzen-ji",
    name: "Chūzen-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.7309,
    lng: 139.4917,
    templeNumber: 18,
    summary:
      "Temple 18 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "oya-ji",
    name: "Ōya-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.5962,
    lng: 139.8209,
    templeNumber: 19,
    summary:
      "Temple 19 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "saimyo-ji",
    name: "Saimyō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.4528,
    lng: 140.1174,
    templeNumber: 20,
    summary:
      "Temple 20 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "satake-ji",
    name: "Satake-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.526,
    lng: 140.5047,
    templeNumber: 22,
    summary:
      "Temple 22 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kanzeon-ji-ibaraki",
    name: "Kanzeon-ji (Shōfuku-ji)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.3863,
    lng: 140.2596,
    templeNumber: 23,
    summary:
      "Temple 23 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "rakuho-ji",
    name: "Rakuhō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.3308,
    lng: 140.1208,
    templeNumber: 24,
    summary:
      "Temple 24 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "bando-kiyotaki-ji-26",
    name: "Kiyotaki-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 36.1652,
    lng: 140.1674,
    templeNumber: 26,
    summary:
      "Temple 26 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "enpuku-ji",
    name: "Enpuku-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.7319,
    lng: 140.8406,
    templeNumber: 27,
    summary:
      "Temple 27 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "ryusho-in",
    name: "Ryushō-in",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.8671,
    lng: 140.3419,
    templeNumber: 28,
    summary:
      "Temple 28 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kozo-ji",
    name: "Kōzō-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.3388,
    lng: 139.9944,
    templeNumber: 30,
    summary:
      "Temple 30 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kasamori-ji",
    name: "Kasamori-ji",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.3996,
    lng: 140.1989,
    templeNumber: 31,
    summary:
      "Temple 31 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "kiyomizu-dera-chiba",
    name: "Kiyomizu-dera (Chiba)",
    kind: "site",
    region: "East Asia",
    tradition: "Pure Land",
    country: "Japan",
    lat: 35.2901,
    lng: 140.3563,
    templeNumber: 32,
    summary:
      "Temple 32 of the Bandō 33 Kannon Pilgrimage.",
    significance:
      "An official fudasho on the Bandō 33 Kannon Pilgrimage circuit.",
  },
  {
    slug: "devdaha",
    name: "Devdaha",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Nepal",
    lat: 27.661,
    lng: 83.566,
    summary:
      "Ancient Koliyan town associated with Queen Maya and the Buddha’s maternal relatives.",
    significance:
      "Often visited with Lumbini and Kapilavastu on Nepal Terai Buddhist itineraries.",
  },
  {
    slug: "ramgram",
    name: "Ramagrama Stupa",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "Nepal",
    lat: 27.4978,
    lng: 83.6811,
    summary:
      "Relic stupa traditionally holding an unopened share of the Buddha’s relics.",
    significance:
      "One of the earliest relic mounds of the Terai; a quieter companion to Lumbini.",
  },
  {
    slug: "kopan",
    name: "Kopan Monastery",
    kind: "site",
    region: "India & Nepal",
    tradition: "Tibetan",
    country: "Nepal",
    lat: 27.7422,
    lng: 85.3642,
    summary:
      "Hilltop Gelug monastery above the Kathmandu Valley, known for introductory courses.",
    significance:
      "A living Himalayan teaching center often combined with valley stupa pilgrimages.",
  },
  {
    slug: "pharping",
    name: "Pharping",
    kind: "site",
    region: "India & Nepal",
    tradition: "Tibetan",
    country: "Nepal",
    lat: 27.6,
    lng: 85.2667,
    summary:
      "Valley town of caves and monasteries linked to Padmasambhava’s practice sites.",
    significance:
      "Important Newar–Tibetan tantric landscape south of Kathmandu.",
  },
  {
    slug: "kesariya",
    name: "Kesariya Stupa",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 26.3341,
    lng: 84.8548,
    summary:
      "Enormous brick stupa in Bihar, among the tallest ancient Buddhist monuments.",
    significance:
      "Associated with the Buddha’s farewell to the Licchavis; a major Magadha heritage stop.",
  },
  {
    slug: "pragbodhi",
    name: "Pragbodhi (Dungeshwari)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 24.695,
    lng: 85.045,
    summary:
      "Hill caves near Bodh Gaya where tradition places the Bodhisattva’s austerities before awakening.",
    significance:
      "Often visited with Mahabodhi as the ‘before enlightenment’ companion site.",
  },
  {
    slug: "barabar-caves",
    name: "Barabar Caves",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 25.005,
    lng: 85.063,
    summary:
      "Mauryan rock-cut caves in Bihar — India’s oldest surviving cave architecture.",
    significance:
      "Primarily Ājīvika in origin; frequently included on Magadha Buddhist tourism circuits.",
  },
  {
    slug: "tawang",
    name: "Tawang Monastery",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "India",
    lat: 27.5864,
    lng: 91.8575,
    summary:
      "Largest monastery in India and a major Gelug seat of Arunachal Pradesh.",
    significance:
      "Himalayan Vajrayana pilgrimage center near the Bhutan–Tibet frontier.",
  },
  {
    slug: "bomdila",
    name: "Bomdila",
    kind: "site",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    country: "India",
    lat: 27.265,
    lng: 92.42,
    summary:
      "Monastic town on the road to Tawang — gateway of West Kameng Buddhism.",
    significance:
      "Often paired with Tawang on Arunachal Himalayan Buddhist itineraries.",
  },
  {
    slug: "muktinath",
    name: "Muktinath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "Nepal",
    lat: 28.8171,
    lng: 83.8717,
    summary:
      "High Mustang shrine sacred to Hindus and Buddhists — also a Divya Desam (Saligramam).",
    significance:
      "Vaishnava and Vajrayana pilgrims share the temple and natural flame nearby.",
  },
  {
    slug: "yamunotri",
    name: "Yamunotri",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 31.01,
    lng: 78.45,
    summary:
      "Source shrine of the Yamuna — western gate of the Chota Char Dham.",
    significance:
      "Seasonal Himalayan pilgrimage temple at the head of the Yamuna valley.",
  },
  {
    slug: "gangotri",
    name: "Gangotri",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.994,
    lng: 78.941,
    summary:
      "Source shrine of the Bhagirathi/Ganga — second of the Chota Char Dham.",
    significance:
      "High Garhwal temple marking the sacred river’s Himalayan origin.",
  },
  {
    slug: "ayodhya",
    name: "Ayodhya",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 26.7992,
    lng: 82.2044,
    summary:
      "Sapta Puri city of Rama — Ram Janmabhoomi and a living Vaishnava pilgrimage capital.",
    significance:
      "One of Hinduism’s seven liberation cities; also central to Ramayana pilgrimage.",
  },
  {
    slug: "kanchipuram",
    name: "Kanchipuram",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 12.832,
    lng: 79.7037,
    summary:
      "Temple city of South India — Sapta Puri and a dense landscape of Shiva and Vishnu shrines.",
    significance:
      "Home of Ekambareswarar and major Divya Desams; a classical moksha-puri.",
  },
  {
    slug: "ujjain",
    name: "Ujjain",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 23.17,
    lng: 75.79,
    summary:
      "Ancient Avanti on the Shipra — Sapta Puri and a Kumbh Mela city.",
    significance:
      "Anchored by Mahakaleshwar Jyotirlinga and continuous Shaiva pilgrimage.",
  },
  {
    slug: "somnath",
    name: "Somnath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 20.888,
    lng: 70.4014,
    summary:
      "First of the twelve Jyotirlingas — seaside Shiva temple of Saurashtra.",
    significance:
      "Destroyed and rebuilt across centuries; traditional starting point of the Jyotirlinga yatra.",
  },
  {
    slug: "mallikarjuna",
    name: "Mallikarjuna (Srisailam)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 16.0742,
    lng: 78.8681,
    summary:
      "Jyotirlinga and Shakti Peetha on the Nallamala hills of Andhra Pradesh.",
    significance:
      "Rare site where Jyotirlinga and goddess shrine share one sacred mountain.",
  },
  {
    slug: "mahakaleshwar",
    name: "Mahakaleshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 23.1828,
    lng: 75.7683,
    summary:
      "South-facing Jyotirlinga of Ujjain — Shiva as Lord of Time.",
    significance:
      "Famous for the dawn Bhasma Aarti; also a Kumbh and Sapta Puri anchor.",
  },
  {
    slug: "omkareshwar",
    name: "Omkareshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 22.2456,
    lng: 76.1511,
    summary:
      "Jyotirlinga on the Om-shaped Mandhata island in the Narmada.",
    significance:
      "Key stop on both the Jyotirlinga yatra and Narmada Parikrama.",
  },
  {
    slug: "bhimashankar",
    name: "Bhimashankar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.072,
    lng: 73.536,
    summary:
      "Forest Jyotirlinga in the Western Ghats near Pune.",
    significance:
      "Maharashtra Shaiva pilgrimage temple amid Sahyadri wildlife sanctuary.",
  },
  {
    slug: "trimbakeshwar",
    name: "Trimbakeshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.9322,
    lng: 73.5308,
    summary:
      "Three-faced Jyotirlinga at the source of the Godavari near Nashik.",
    significance:
      "Paired with Nashik for Kumbh geography and Godavari pilgrimage.",
  },
  {
    slug: "vaidyanath",
    name: "Vaidyanath (Deoghar)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 24.4925,
    lng: 86.7,
    summary:
      "Jyotirlinga of Deoghar, Jharkhand — Shiva as divine physician.",
    significance:
      "One of the most visited eastern Jyotirlingas (competing claims exist elsewhere).",
  },
  {
    slug: "nageshwar",
    name: "Nageshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 22.3359,
    lng: 69.0869,
    summary:
      "Jyotirlinga near Dwarka — Shiva as Lord of Serpents.",
    significance:
      "Often combined with Dwarka Char Dham on western Gujarat itineraries.",
  },
  {
    slug: "grishneshwar",
    name: "Grishneshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 20.025,
    lng: 75.1699,
    summary:
      "Twelfth Jyotirlinga beside the Ellora caves in Maharashtra.",
    significance:
      "Compact shrine completing the classical twelve; near Ellora’s rock-cut temples.",
  },
  {
    slug: "kamakhya",
    name: "Kamakhya",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 26.1664,
    lng: 91.7055,
    summary:
      "Great Shakti Peetha of Assam on Nilachal Hill — living center of goddess worship.",
    significance:
      "Among the four Adi Peethas; famous for Ambubachi and Tantric pilgrimage.",
  },
  {
    slug: "kalighat",
    name: "Kalighat",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 22.52,
    lng: 88.3419,
    summary:
      "Kali temple of Kolkata — one of the Adi Shakti Peethas.",
    significance:
      "Urban goddess pilgrimage of Bengal; traditionally linked to Sati’s toes.",
  },
  {
    slug: "tara-tarini",
    name: "Tara Tarini",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.4897,
    lng: 84.8998,
    summary:
      "Twin-goddess hill shrine of Odisha — counted among the Adi Peethas.",
    significance:
      "Major Shakta pilgrimage of southern Odisha overlooking the Rushikulya.",
  },
  {
    slug: "bimala",
    name: "Bimala Temple (Puri)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.8047,
    lng: 85.8183,
    summary:
      "Shakti shrine within the Jagannath complex — Adi Peetha of Puri.",
    significance:
      "Links Shaakta and Vaishnava pilgrimage at the eastern Char Dham.",
  },
  {
    slug: "ekambareswarar",
    name: "Ekambareswarar (Kanchipuram)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 12.8475,
    lng: 79.7,
    summary:
      "Earth (Prithvi) lingam temple — first of the Pancha Bhoota Stalam.",
    significance:
      "Vast Dravidian complex under a sacred mango tree in Kanchipuram.",
  },
  {
    slug: "jambukeswarar",
    name: "Jambukeswarar (Thiruvanaikaval)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 10.8533,
    lng: 78.7056,
    summary:
      "Water (Appu) lingam temple near Tiruchirappalli.",
    significance:
      "Sanctum spring eternally bathes the lingam — Pancha Bhoota water shrine.",
  },
  {
    slug: "arunachaleswarar",
    name: "Arunachaleswarar (Tiruvannamalai)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 12.2316,
    lng: 79.0672,
    summary:
      "Fire (Agni) lingam — Annamalaiyar temple beneath the holy hill.",
    significance:
      "Pancha Bhoota fire shrine; Karthigai Deepam lights the mountain as lingam.",
  },
  {
    slug: "srikalahasti",
    name: "Srikalahasti",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 13.7494,
    lng: 79.6983,
    summary:
      "Air (Vayu) lingam temple in Andhra Pradesh.",
    significance:
      "Pancha Bhoota wind shrine famed for Rahu–Ketu rites and the flickering lamp.",
  },
  {
    slug: "chidambaram",
    name: "Chidambaram Nataraja",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 11.3994,
    lng: 79.6933,
    summary:
      "Space (Akasha) shrine of Nataraja — Thillai temple of the cosmic dance.",
    significance:
      "Pancha Bhoota ether shrine; Chidambara Rahasya honors formless space.",
  },
  {
    slug: "morgaon",
    name: "Morgaon (Mayureshwar)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 18.2761,
    lng: 74.3214,
    summary:
      "First Ashta Vinayak temple — Mayureshwar at Morgaon.",
    significance:
      "Traditional starting point of the eight-Ganesha Maharashtra circuit.",
  },
  {
    slug: "siddhatek",
    name: "Siddhatek",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 18.4214,
    lng: 74.7894,
    summary:
      "Siddhivinayak of Siddhatek — Ashta Vinayak temple on the Bhima.",
    significance:
      "Second of the eight; reached by river-crossing pilgrimage paths.",
  },
  {
    slug: "ballaleshwar-pali",
    name: "Ballaleshwar (Pali)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 18.5356,
    lng: 73.2241,
    summary:
      "Ashta Vinayak temple of Pali — Ballaleshwar.",
    significance:
      "Named for the child-devotee Ballal; Konkan-facing Maharashtra shrine.",
  },
  {
    slug: "varadvinayak",
    name: "Varadvinayak (Mahad)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 18.5569,
    lng: 73.1467,
    summary:
      "Ashta Vinayak of Mahad — the boon-giving Ganesha.",
    significance:
      "One of eight; often visited with Pali on the coastal–ghat circuit.",
  },
  {
    slug: "theur",
    name: "Chintamani (Theur)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 18.5238,
    lng: 74.0463,
    summary:
      "Ashta Vinayak of Theur — Chintamani near Pune.",
    significance:
      "Wish-fulfilling Ganesha shrine of the eight-temple yatra.",
  },
  {
    slug: "lenyadri",
    name: "Lenyadri (Girijatmaj)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.2428,
    lng: 73.8856,
    summary:
      "Cave Ashta Vinayak — Girijatmaj on Lenyadri hill.",
    significance:
      "Rock-cut Ganesha shrine reached by steep steps above Junnar.",
  },
  {
    slug: "ozar",
    name: "Vighnahar (Ozar)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.1883,
    lng: 73.9581,
    summary:
      "Ashta Vinayak of Ozar — remover of obstacles.",
    significance:
      "Hill-flank temple on the Kukadi; seventh of the eight.",
  },
  {
    slug: "ranjangaon",
    name: "Mahaganapati (Ranjangaon)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 18.7611,
    lng: 74.2392,
    summary:
      "Ashta Vinayak of Ranjangaon — Mahaganapati.",
    significance:
      "Often the concluding temple of the eight-Ganesha circuit.",
  },
  {
    slug: "tungnath",
    name: "Tungnath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.4894,
    lng: 79.2153,
    summary:
      "Highest Shiva temple in the world among the Panch Kedar.",
    significance:
      "Second of five Garhwal Kedar shrines; approached by high alpine trail.",
  },
  {
    slug: "rudranath",
    name: "Rudranath",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.5333,
    lng: 79.3333,
    summary:
      "Forest Panch Kedar shrine of Rudra in a high meadow.",
    significance:
      "One of the more remote of the five Kedars — demanding trek pilgrimage.",
  },
  {
    slug: "madhyamaheshwar",
    name: "Madhyamaheshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.6369,
    lng: 79.2161,
    summary:
      "Middle Kedar temple in a glacial amphitheatre of Garhwal.",
    significance:
      "Fourth of the Panch Kedar; seasonal high-altitude Shaiva shrine.",
  },
  {
    slug: "kalpeshwar",
    name: "Kalpeshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.577,
    lng: 79.4229,
    summary:
      "Cave Panch Kedar of Shiva’s hair — only one open year-round.",
    significance:
      "Fifth Kedar near Urgam; completes the five-shrine Garhwal circuit.",
  },
  {
    slug: "vishnuprayag",
    name: "Vishnuprayag",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.5625,
    lng: 79.5753,
    summary:
      "Highest of the Panch Prayag — Alaknanda meets Dhauliganga.",
    significance:
      "First confluence on the descent toward Badrinath roads.",
  },
  {
    slug: "nandprayag",
    name: "Nandprayag",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.33,
    lng: 79.33,
    summary:
      "Panch Prayag where Alaknanda meets the Nandakini.",
    significance:
      "Quieter Garhwal sangam on the Char Dham highway corridor.",
  },
  {
    slug: "karnaprayag",
    name: "Karnaprayag",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.259,
    lng: 79.218,
    summary:
      "Panch Prayag of Alaknanda and Pindar — linked to Karna lore.",
    significance:
      "Major road junction sangam of the Garhwal pilgrimage belt.",
  },
  {
    slug: "rudraprayag",
    name: "Rudraprayag",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.28,
    lng: 78.98,
    summary:
      "Sangam of Alaknanda and Mandakini — fork toward Kedarnath.",
    significance:
      "Strategic Panch Prayag where Kedarnath and Badrinath roads diverge.",
  },
  {
    slug: "devprayag",
    name: "Devprayag",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 30.146,
    lng: 78.598,
    summary:
      "Where Alaknanda and Bhagirathi become the Ganga.",
    significance:
      "Final and most famous of the Panch Prayag — birth of the named Ganga.",
  },
  {
    slug: "prayagraj",
    name: "Prayagraj (Triveni Sangam)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 25.4295,
    lng: 81.8847,
    summary:
      "Triveni Sangam of Ganga, Yamuna, and mythical Saraswati — foremost Kumbh site.",
    significance:
      "Also on Rama and broader tirtha circuits; host of the Maha Kumbh.",
  },
  {
    slug: "panchavati",
    name: "Panchavati (Nashik)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 19.9975,
    lng: 73.7898,
    summary:
      "Ramayana forest grove on the Godavari at Nashik.",
    significance:
      "Rama–Sita exile site and Kumbh geography beside Trimbakeshwar.",
  },
  {
    slug: "chitrakoot",
    name: "Chitrakoot",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 25.148,
    lng: 80.867,
    summary:
      "Forest pilgrimage landscape of Rama’s exile — Kamadgiri and ghats.",
    significance:
      "Major Ramayana trail stop between Ayodhya and the Deccan.",
  },
  {
    slug: "vrindavan",
    name: "Vrindavan",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 27.58,
    lng: 77.7,
    summary:
      "Town of Krishna’s youth — temples, kunjs, and Braj bhakti.",
    significance:
      "Heart of the Braj Mandal with Mathura and Govardhan.",
  },
  {
    slug: "govardhan",
    name: "Govardhan",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 27.5105,
    lng: 77.4761,
    summary:
      "Sacred hill worshipped as Giriraj — focus of the ~21 km parikrama.",
    significance:
      "Living Krishna landscape of Braj; walked barefoot by countless pilgrims.",
  },
  {
    slug: "barsana",
    name: "Barsana",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 27.6489,
    lng: 77.3789,
    summary:
      "Hill town of Radha — Braj pilgrimage companion to Vrindavan.",
    significance:
      "Famous for Lathmar Holi and Radha Rani Temple.",
  },
  {
    slug: "gokul",
    name: "Gokul",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 27.45,
    lng: 77.72,
    summary:
      "Childhood village of Krishna across the Yamuna from Mathura.",
    significance:
      "Early Braj stop on Krishna Leela itineraries.",
  },
  {
    slug: "kurukshetra",
    name: "Kurukshetra",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 29.9657,
    lng: 76.837,
    summary:
      "Battlefield and teaching place of the Bhagavad Gita.",
    significance:
      "Linked to Krishna pilgrimage beyond Braj proper.",
  },
  {
    slug: "amarkantak",
    name: "Amarkantak",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 22.822,
    lng: 81.7532,
    summary:
      "Source of the Narmada — traditional start and end of Narmada Parikrama.",
    significance:
      "Maikal Hills tirtha where river circumambulation begins.",
  },
  {
    slug: "maheshwar",
    name: "Maheshwar",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 22.11,
    lng: 75.35,
    summary:
      "Historic Narmada ghat town of Ahilyabai Holkar’s temples.",
    significance:
      "Major mid-river stop on Narmada Parikrama.",
  },
  {
    slug: "bharuch",
    name: "Bharuch (Narmada mouth)",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 21.712,
    lng: 72.993,
    summary:
      "Where the Narmada meets the Arabian Sea — turnaround of the parikrama.",
    significance:
      "Pilgrims reverse banks near the gulf to complete the river circuit.",
  },
  {
    slug: "manimahesh",
    name: "Manimahesh Lake",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 32.395,
    lng: 76.6372,
    summary:
      "High glacial lake under Manimahesh Kailash — Himachal’s great Shiva yatra.",
    significance:
      "State-level seasonal pilgrimage of Chamba; often called the Kailash of Himachal.",
  },
  {
    slug: "vaishno-devi",
    name: "Vaishno Devi",
    kind: "site",
    region: "India & Nepal",
    tradition: "Hindu",
    country: "India",
    lat: 33.0299,
    lng: 74.9482,
    summary:
      "Cave shrine of the goddess in the Trikuta hills of Jammu.",
    significance:
      "Among India’s most visited Devi pilgrimages; trek from Katra.",
  }
];

export const PILGRIMAGE_ROUTES: PilgrimageRoute[] = [
  {
    slug: "four-great-sites",
    name: "Four Great Sites of the Buddha",
    kind: "route",
    region: "India & Nepal",
    tradition: "Buddhist",
    summary:
      "The classical life-circuit named in the Pali canon: birth, awakening, first teaching, and parinirvana.",
    lengthNote: "4 core sites across Nepal and northern India",
    significance:
      "Named in the Mahāparinibbāna Sutta as places the faithful should visit with reverence. Modern travelers often combine them into one northern India–Nepal road journey.",
    stopSlugs: ["lumbini", "bodh-gaya", "sarnath", "kushinagar"],
  },
  {
    slug: "buddhist-circuit-india",
    name: "Buddhist Circuit (India & Nepal)",
    kind: "route",
    region: "India & Nepal",
    tradition: "Buddhist",
    summary:
      "Expanded pilgrimage through Magadha and the Gangetic plain — the four great sites plus early teaching centers.",
    lengthNote: "Usually 1–3 weeks by road",
    significance:
      "Beyond the four life sites, pilgrims add Shravasti, Rajgir, Nalanda, and Vaishali — the landscape of early sangha history and Mahayana memory.",
    stopSlugs: [
      "lumbini",
      "devdaha",
      "kapilavastu",
      "ramgram",
      "kushinagar",
      "shravasti",
      "sankassa",
      "sarnath",
      "bodh-gaya",
      "pragbodhi",
      "rajgir",
      "nalanda",
      "kesariya",
      "vaishali",
      "vikramshila"
    ],
  },
  {
    slug: "kathmandu-valley",
    name: "Kathmandu Valley Stupas",
    kind: "route",
    region: "India & Nepal",
    tradition: "Buddhist",
    summary:
      "Valley pilgrimage of great stupas and Newar–Tibetan Buddhist life — often joined with a journey to Lumbini.",
    lengthNote: "1–3 days in the valley (+ optional Lumbini)",
    significance:
      "Swayambhunath and Boudhanath are daily kora landscapes for local and Himalayan Buddhists. Many international pilgrims add Lumbini, the Buddha’s birthplace, on the same Nepal itinerary.",
    stopSlugs: [
      "swayambhunath",
      "boudhanath",
      "golden-temple-patan",
      "pashupatinath",
      "kopan",
      "pharping",
      "namo-buddha",
      "lumbini"
    ],
  },
  {
    slug: "sri-lanka-sacred-cities",
    name: "Sri Lanka Cultural Triangle",
    kind: "route",
    region: "Sri Lanka",
    tradition: "Theravada",
    summary:
      "Theravada pilgrimage through ancient capitals and the living tooth-relic cult — the island’s classic sacred circuit.",
    lengthNote: "Cultural triangle, often 5–10 days",
    significance:
      "Anuradhapura and Polonnaruwa preserve the monumental dagoba landscape of early Sinhala Buddhism; Kandy’s Temple of the Tooth remains a living national shrine.",
    stopSlugs: [
      "anuradhapura",
      "mihintale",
      "dambulla",
      "polonnaruwa",
      "kandy-tooth-relic",
    ],
  },
  {
    slug: "sri-pada-ascent",
    name: "Sri Pada Night Ascent",
    kind: "route",
    region: "Sri Lanka",
    tradition: "Interfaith",
    summary:
      "Night climb to Adam’s Peak for sunrise over the sacred footprint — one of Asia’s great shared mountain pilgrimages.",
    lengthNote: "Overnight ascent · ~5–7 hours up",
    significance:
      "Buddhists honor Sri Pada as the Buddha’s footprint; Hindus, Muslims, and some Christians also claim the summit. Pilgrims usually climb by torchlight and descend after dawn.",
    stopSlugs: [
      "nallathanniya",
      "sri-pada",
    ],
  },
  {
    slug: "shikoku-88",
    name: "Shikoku 88 Temple Pilgrimage",
    kind: "route",
    region: "East Asia",
    tradition: "Mahayana",
    summary:
      "Henro path circling Shikoku in the footsteps of Kūkai — Japan’s most famous long-distance Buddhist pilgrimage.",
    lengthNote: "~1,200 km / 30–60 walking days · 88 temples",
    significance:
      "The full circuit visits all 88 official temples clockwise through Tokushima, Kōchi, Ehime, and Kagawa. Walkers (aruki-henro) often take 30–60 days; many others travel by car, taxi, or bus. This guide maps all 88 official temples in order — from Temple 1 at Ryōzen-ji to Temple 88 at Ōkubo-ji. After finishing, pilgrims traditionally continue to Mount Kōya on Honshu to report the journey at Okunoin.",
    stopSlugs: [
      "ryozen-ji",
      "gokuraku-ji",
      "konsen-ji",
      "shikoku-dainichi-ji-4",
      "jizo-ji",
      "shikoku-anraku-ji-6",
      "juraku-ji",
      "kumadani-ji",
      "horin-ji",
      "kirihata-ji",
      "shikoku-fujii-dera-11",
      "shosan-ji",
      "shikoku-dainichi-ji-13",
      "shikoku-joraku-ji-14",
      "awa-kokubun-ji",
      "shikoku-kannon-ji-16",
      "ido-ji",
      "onzan-ji",
      "tatsue-ji",
      "kakurin-ji",
      "tairyu-ji",
      "byodo-ji",
      "yakuo-ji",
      "hotsumisaki-ji",
      "shinsho-ji",
      "kongocho-ji",
      "konomine-ji",
      "shikoku-dainichi-ji-28",
      "tosa-kokubun-ji",
      "zenraku-ji",
      "chikurin-ji",
      "zenjibu-ji",
      "sekkei-ji",
      "tanema-ji",
      "shikoku-kiyotaki-ji-35",
      "shoryu-ji",
      "iwamoto-ji",
      "kongofuku-ji",
      "enko-ji",
      "kanjizai-ji",
      "ryuko-ji",
      "butsumoku-ji",
      "meiseki-ji",
      "daiho-ji",
      "iwaya-ji",
      "joruri-ji",
      "yasaka-ji",
      "sairin-ji",
      "jodo-ji",
      "hanta-ji",
      "ishite-ji",
      "shikoku-taisan-ji-52",
      "enmyo-ji",
      "enmei-ji",
      "nankobo",
      "shikoku-taisan-ji-56",
      "eifuku-ji",
      "senyu-ji",
      "iyo-kokubun-ji",
      "yokomine-ji",
      "koon-ji",
      "hoju-ji",
      "kichijo-ji",
      "maegami-ji",
      "sankaku-ji",
      "unpen-ji",
      "daiko-ji",
      "jinne-in",
      "shikoku-kannon-ji-69",
      "motoyama-ji",
      "iyadani-ji",
      "mandara-ji",
      "shusshaka-ji",
      "koyama-ji",
      "zentsu-ji",
      "konzo-ji",
      "doryu-ji",
      "gosho-ji",
      "tenno-ji",
      "sanuki-kokubun-ji",
      "shiromine-ji",
      "negoro-ji",
      "ichinomiya-ji",
      "yashima-ji",
      "yakuri-ji",
      "shido-ji",
      "nagao-ji",
      "okubo-ji"
    ],
  },
  {
    slug: "saigoku-kannon",
    name: "Saigoku Kannon Pilgrimage",
    kind: "route",
    region: "East Asia",
    tradition: "Pure Land",
    summary:
      "Japan’s oldest major Buddhist circuit — 33 temples of Kannon across Kansai, older than the Shikoku henro.",
    lengthNote: "~1,000 km · 33 temples",
    significance:
      "Established over a millennium ago and still walked as a Japan Heritage route. Traditionally begun at Seiganto-ji by Nachi Falls and continued through Nara, Kyoto, Shiga, and beyond. This guide maps all 33 official temples of the western circuit.",
    stopSlugs: [
      "seiganto-ji",
      "kimii-dera",
      "kokawa-dera",
      "sefuku-ji",
      "saigoku-fujii-dera-5",
      "minamihokke-ji",
      "oka-dera",
      "hase-dera",
      "nanendo",
      "mimuroto-ji",
      "kami-daigo-ji",
      "shoho-ji-iwama",
      "ishiyama-dera",
      "mii-dera",
      "imakumano-kannon-ji",
      "kiyomizu-dera",
      "rokuharamitsu-ji",
      "choho-ji",
      "gyogan-ji",
      "yoshimine-dera",
      "anao-ji",
      "soji-ji-ibaraki",
      "katsuo-ji",
      "nakayama-dera",
      "kiyomizu-dera-hyogo",
      "ichijo-ji",
      "engyo-ji",
      "nariai-ji",
      "matsunoo-dera",
      "hogon-ji",
      "chomei-ji",
      "kannonsho-ji",
      "kegon-ji"
    ],
  },
  {
    slug: "kumano-kodo",
    name: "Kumano Kodō",
    kind: "route",
    region: "East Asia",
    tradition: "Interfaith",
    summary:
      "UNESCO network of mountain trails to the three Kumano grand shrines — Japan’s great syncretic pilgrimage of forest and waterfall.",
    lengthNote: "Nakahechi often 2–4 walking days",
    significance:
      "For centuries emperors and commoners walked these paths to Hongū, Hayatama, and Nachi. Buddhist and Shinto meanings overlay the same landscape (honji suijaku). The Kohechi trail also links Kumano with Mount Kōya; Seiganto-ji beside Nachi is Temple 1 of the Saigoku Kannon route.",
    stopSlugs: [
      "koyasan",
      "kumano-hongu",
      "kumano-hayatama",
      "kumano-nachi",
      "seiganto-ji",
    ],
  },
  {
    slug: "dewa-sanzan",
    name: "Dewa Sanzan",
    kind: "route",
    region: "East Asia",
    tradition: "Interfaith",
    summary:
      "Three sacred mountains of Dewa — Haguro, Gassan, and Yudono — walked as birth, death, and rebirth in Shugendō practice.",
    lengthNote: "2–3 days in season",
    significance:
      "Northern Japan’s classic mountain-entry pilgrimage. Mount Haguro is open year-round; Gassan and Yudono are seasonal. Yamabushi ascetics and lay pilgrims still climb the cedar stairs and alpine trails as a condensed life-cycle rite.",
    stopSlugs: ["mount-haguro", "mount-gassan", "mount-yudono"],
  },
  {
    slug: "kailash-kora",
    name: "Mount Kailash Kora",
    kind: "route",
    region: "Tibet & Himalaya",
    tradition: "Interfaith",
    summary:
      "The high circumambulation of Kailash — a demanding kora shared by Tibetan Buddhists, Bonpos, Hindus, and Jains.",
    lengthNote: "~52 km circuit, 2–3 days",
    significance:
      "Pilgrims usually combine the mountain kora with ritual time at Lake Manasarovar. The full walk crosses the Dolma La pass above 5,600 m and is among the world’s most physically demanding sacred circuits.",
    stopSlugs: [
      "lake-manasarovar",
      "dirapuk",
      "mount-kailash",
      "zutulpuk",
    ],
  },
  {
    slug: "lhasa-barkhor",
    name: "Lhasa Sacred Circuit",
    kind: "route",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    summary:
      "Inner pilgrimage of the Tibetan capital — Jokhang and Barkhor, the Potala, and the great Gelug monasteries.",
    lengthNote: "Urban + short outings from Lhasa",
    significance:
      "Devotional life centers on the Jokhang and Barkhor kora, then widens to the Potala and monastic seats of Drepung and Sera. Samye, Tibet’s first monastery, is a common overnight addition down-valley.",
    stopSlugs: [
      "jokhang",
      "potala",
      "drepung",
      "sera",
      "ganden",
      "samye"
    ],
  },
  {
    slug: "china-four-mountains",
    name: "Four Sacred Buddhist Mountains of China",
    kind: "route",
    region: "East Asia",
    tradition: "Mahayana",
    summary:
      "Classic Chinese Buddhist mountain pilgrimage — Wutai, Emei, Jiuhua, and Putuo, each tied to a great bodhisattva.",
    lengthNote: "Multi-province journey",
    significance:
      "Wutai (Manjushri), Emei (Samantabhadra), Jiuhua (Kṣitigarbha), and Putuo (Avalokiteśvara) form the canonical four famous Buddhist mountains. Pilgrims may visit one peak deeply or attempt the full set over multiple trips.",
    stopSlugs: [
      "wutai-shan",
      "emei-shan",
      "leshan-buddha",
      "jiuhua-shan",
      "putuo-shan"
    ],
  },
  {
    slug: "myanmar-sacred-sites",
    name: "Myanmar Sacred Circuit",
    kind: "route",
    region: "Southeast Asia",
    tradition: "Theravada",
    summary:
      "From Yangon’s golden Shwedagon to Bagan’s temple plain and Mandalay’s Mahamuni — Myanmar’s great Theravada axis.",
    lengthNote: "Regional itinerary by air + road",
    significance:
      "Shwedagon is the country’s preeminent living stupa; Bagan offers a horizontal pilgrimage across an ancient capital; Mahamuni concentrates Upper Myanmar devotion on a single sacred image.",
    stopSlugs: [
      "shwedagon",
      "kyaiktiyo",
      "bagan",
      "sagaing",
      "mahamuni",
    ],
  },
  {
    slug: "southeast-asia-stupas",
    name: "Southeast Asian Stupa Route",
    kind: "route",
    region: "Southeast Asia",
    tradition: "Buddhist",
    summary:
      "A curated arc through monumental Theravada and Mahayana landscapes of mainland and island Southeast Asia.",
    lengthNote: "Regional itinerary, often by air + local travel",
    significance:
      "Links Myanmar’s Shwedagon, Cambodia’s Angkor, and Java’s Borobudur — three different Buddhist (and formerly Hindu–Buddhist) monumental languages across the region.",
    stopSlugs: [
      "shwedagon",
      "that-luang",
      "angkor-wat",
      "bayon",
      "borobudur",
      "prambanan"
    ],
  },
  {
    slug: "chichibu-34",
    name: "Chichibu 34 Kannon",
    kind: "route",
    region: "East Asia",
    tradition: "Pure Land",
    summary:
      "Compact Kannon circuit through Saitama’s Chichibu basin — the shortest leg of the Japan 100 Kannon pilgrimage.",
    lengthNote: "~100 km · often 3–5 walking days",
    significance:
      "Thirty-four neighborhood and mountain temples dedicated to Kannon. Together with Saigoku (33) and Bandō (33) it completes Japan’s classic 100-temple Kannon pilgrimage. Quieter and more walkable than Shikoku or Saigoku.",
    stopSlugs: [
      "shimabuji",
      "shimpuku-ji",
      "josen-ji",
      "kinsho-ji",
      "goka-do",
      "bokuun-ji",
      "hocho-ji",
      "saizen-ji",
      "akechi-ji",
      "daiji-ji",
      "chichibu-joraku-ji-11",
      "nosaka-ji",
      "jigen-ji",
      "imamiya-bo",
      "shorin-ji",
      "saiko-ji",
      "jorin-ji",
      "godo-ji",
      "ryuseki-ji",
      "iwanoue-do",
      "chichibu-kannon-ji-21",
      "doji-do",
      "ongaku-ji",
      "hosen-ji",
      "kyusho-ji",
      "enyu-ji",
      "daien-ji",
      "hashidate-do",
      "chosen-in",
      "houn-ji",
      "kannon-in",
      "hosho-ji",
      "kikusui-ji",
      "suisenji"
    ],
  },
  {
    slug: "bando-33",
    name: "Bandō 33 Kannon",
    kind: "route",
    region: "East Asia",
    tradition: "Pure Land",
    summary:
      "Kantō’s great Kannon circuit — from Kamakura through Tokyo to the Chiba coast, second of the Japan 100 Kannon set.",
    lengthNote: "~1,300 km · 33 temples",
    significance:
      "Established in the Kamakura period and popularized under the shogunate. This guide maps all 33 Bandō temples from Sugimoto-dera (start) to Nago-ji (finish).",
    stopSlugs: [
      "sugimoto-dera",
      "ganden-ji",
      "anyo-in",
      "hase-dera-kamakura",
      "shofuku-ji",
      "chokoku-ji-atsugi",
      "komyo-ji",
      "shokoku-ji",
      "jiko-ji",
      "shobo-ji",
      "bando-anraku-ji-11",
      "jion-ji",
      "senso-ji",
      "gumyo-ji",
      "chokoku-ji-gunma",
      "mizusawa-dera",
      "mangan-ji",
      "chuzen-ji",
      "oya-ji",
      "saimyo-ji",
      "nichirin-ji",
      "satake-ji",
      "kanzeon-ji-ibaraki",
      "rakuho-ji",
      "omi-do",
      "bando-kiyotaki-ji-26",
      "enpuku-ji",
      "ryusho-in",
      "chiba-dera",
      "kozo-ji",
      "kasamori-ji",
      "kiyomizu-dera-chiba",
      "nago-ji"
    ],
  },
  {
    slug: "japan-100-kannon",
    name: "Japan 100 Kannon",
    kind: "route",
    region: "East Asia",
    tradition: "Pure Land",
    summary:
      "The full national Kannon pilgrimage — Saigoku 33 + Bandō 33 + Chichibu 34, traditionally completed as one lifelong vow.",
    lengthNote: "100 temples across Kansai & Kantō",
    significance:
      "From the Muromachi period onward, pilgrims who finished Saigoku added Bandō and Chichibu to reach one hundred Kannon temples. This guide lists all 100 temples in traditional circuit order.",
    stopSlugs: [
      "seiganto-ji",
      "kimii-dera",
      "kokawa-dera",
      "sefuku-ji",
      "saigoku-fujii-dera-5",
      "minamihokke-ji",
      "oka-dera",
      "hase-dera",
      "nanendo",
      "mimuroto-ji",
      "kami-daigo-ji",
      "shoho-ji-iwama",
      "ishiyama-dera",
      "mii-dera",
      "imakumano-kannon-ji",
      "kiyomizu-dera",
      "rokuharamitsu-ji",
      "choho-ji",
      "gyogan-ji",
      "yoshimine-dera",
      "anao-ji",
      "soji-ji-ibaraki",
      "katsuo-ji",
      "nakayama-dera",
      "kiyomizu-dera-hyogo",
      "ichijo-ji",
      "engyo-ji",
      "nariai-ji",
      "matsunoo-dera",
      "hogon-ji",
      "chomei-ji",
      "kannonsho-ji",
      "kegon-ji",
      "sugimoto-dera",
      "ganden-ji",
      "anyo-in",
      "hase-dera-kamakura",
      "shofuku-ji",
      "chokoku-ji-atsugi",
      "komyo-ji",
      "shokoku-ji",
      "jiko-ji",
      "shobo-ji",
      "bando-anraku-ji-11",
      "jion-ji",
      "senso-ji",
      "gumyo-ji",
      "chokoku-ji-gunma",
      "mizusawa-dera",
      "mangan-ji",
      "chuzen-ji",
      "oya-ji",
      "saimyo-ji",
      "nichirin-ji",
      "satake-ji",
      "kanzeon-ji-ibaraki",
      "rakuho-ji",
      "omi-do",
      "bando-kiyotaki-ji-26",
      "enpuku-ji",
      "ryusho-in",
      "chiba-dera",
      "kozo-ji",
      "kasamori-ji",
      "kiyomizu-dera-chiba",
      "nago-ji",
      "shimabuji",
      "shimpuku-ji",
      "josen-ji",
      "kinsho-ji",
      "goka-do",
      "bokuun-ji",
      "hocho-ji",
      "saizen-ji",
      "akechi-ji",
      "daiji-ji",
      "chichibu-joraku-ji-11",
      "nosaka-ji",
      "jigen-ji",
      "imamiya-bo",
      "shorin-ji",
      "saiko-ji",
      "jorin-ji",
      "godo-ji",
      "ryuseki-ji",
      "iwanoue-do",
      "chichibu-kannon-ji-21",
      "doji-do",
      "ongaku-ji",
      "hosen-ji",
      "kyusho-ji",
      "enyu-ji",
      "daien-ji",
      "hashidate-do",
      "chosen-in",
      "houn-ji",
      "kannon-in",
      "hosho-ji",
      "kikusui-ji",
      "suisenji"
    ],
  },
  {
    slug: "choishi-michi",
    name: "Chōishi-michi to Kōyasan",
    kind: "route",
    region: "East Asia",
    tradition: "Mahayana",
    summary:
      "Stone-marker approach trail from Jison-in up to Mount Kōya — the classic walking entrance to Kūkai’s mountain.",
    lengthNote: "~24 km · 7–8 hours walking",
    significance:
      "Part of the UNESCO Sacred Sites and Pilgrimage Routes in the Kii Mountain Range. Pilgrims follow chōishi stupa-markers from the valley floor to the Daimon gate and temple town of Kōyasan.",
    stopSlugs: [
      "jison-in",
      "koyasan",
    ],
  },
  {
    slug: "korea-three-jewels",
    name: "Three Jewel Temples of Korea",
    kind: "route",
    region: "East Asia",
    tradition: "Mahayana",
    summary:
      "Korea’s Sambosa plus Bulguksa and Seokguram — Three Jewels temples and Silla’s UNESCO masterpiece.",
    lengthNote: "Multi-province journey · 5 temples",
    significance:
      "Tongdosa, Haeinsa, and Songgwangsa keep the Three Jewels; Bulguksa and Seokguram add Unified Silla’s UNESCO architectural summit.",
    stopSlugs: [
      "tongdosa",
      "haeinsa",
      "songgwangsa",
      "bulguksa",
      "seokguram"
    ],
  },
  {
    slug: "thailand-historic-capitals",
    name: "Thai Historic Capitals",
    kind: "route",
    region: "Southeast Asia",
    tradition: "Theravada",
    summary:
      "Theravada pilgrimage through Thailand’s sacred capitals — Ayutthaya, Sukhothai, and the mountain wat of Doi Suthep.",
    lengthNote: "Regional itinerary by train/air + songthaew",
    significance:
      "Ayutthaya and Sukhothai preserve the classical Siamese Buddhist city; Doi Suthep adds northern Lanna devotion above Chiang Mai. Together they sketch Thailand’s historic sacred geography beyond Bangkok alone.",
    stopSlugs: [
      "wat-phra-kaew",
      "wat-pho",
      "wat-arun",
      "phra-pathom",
      "ayutthaya",
      "sukhothai",
      "si-satchanalai",
      "doi-suthep"
    ],
  },
  {
    slug: "hindu-char-dham",
    name: "Hindu Char Dham",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "The classical four-cornered Hindu pilgrimage of India — Badrinath, Dwarka, Puri, and Rameswaram.",
    lengthNote: "Pan-Indian circuit · often a lifelong vow",
    significance:
      "Attributed to Adi Shankara’s unifying vision: north, west, east, and south Vishnu–Shiva shrines framing the subcontinent.",
    stopSlugs: [
      "badrinath",
      "dwarka",
      "jagannath-puri",
      "rameswaram"
    ],
  },
  {
    slug: "chota-char-dham",
    name: "Chota Char Dham (Himalaya)",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Garhwal Himalayan pilgrimage of Yamunotri–Gangotri–Kedarnath–Badrinath (this guide maps the two great temples).",
    lengthNote: "Seasonal mountain circuit · often 10–14 days",
    significance:
      "North India’s high-altitude Char Dham, walked or driven when mountain roads open each summer.",
    stopSlugs: [
      "yamunotri",
      "gangotri",
      "kedarnath",
      "badrinath"
    ]
  },
  {
    slug: "hindu-sacred-cities",
    name: "Hindu Sacred Cities",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Living sacred cities of Sapta Puri and South Indian temple pilgrimage — Varanasi, Mathura, Haridwar, Tirupati, Madurai.",
    lengthNote: "Multi-city Indian itinerary",
    significance:
      "Pairs Gangetic liberation cities with Tirumala and Madurai — the urban heart of Hindu pilgrimage beyond mountain circuits.",
    stopSlugs: [
      "varanasi",
      "mathura",
      "haridwar",
      "tirupati",
      "meenakshi-madurai",
      "pashupatinath",
      "vaishno-devi"
    ],
  },
  {
    slug: "india-rock-cut",
    name: "India Rock-Cut Temples",
    kind: "route",
    region: "India & Nepal",
    tradition: "Interfaith",
    summary:
      "Cave temple pilgrimage of the western Deccan — Ajanta, Ellora, and Elephanta.",
    lengthNote: "Maharashtra circuit · often 3–5 days",
    significance:
      "UNESCO Buddhist, Hindu, and Jain rock-cut sanctuaries that define Indian sacred architecture in stone.",
    stopSlugs: [
      "ajanta",
      "ellora",
      "elephanta"
    ],
  },
  {
    slug: "gandhara-heritage",
    name: "Gandhara Buddhist Heritage",
    kind: "route",
    region: "India & Nepal",
    tradition: "Buddhist",
    summary:
      "Northwest Buddhist landscape of Taxila and Takht-i-Bahi — where Greco-Buddhist art flourished.",
    lengthNote: "Pakistan heritage itinerary",
    significance:
      "UNESCO sites of the ancient university city and hill monastery that shaped early Mahayana imagery.",
    stopSlugs: [
      "taxila",
      "takht-i-bahi"
    ],
  },
  {
    slug: "china-grottoes",
    name: "Chinese Buddhist Grottoes",
    kind: "route",
    region: "East Asia",
    tradition: "Mahayana",
    summary:
      "Silk Road and imperial cave temples — Mogao, Yungang, Longmen — plus the Leshan cliff Buddha.",
    lengthNote: "Multi-province China journey",
    significance:
      "The sculptural spine of Chinese Buddhism from Northern Wei through Tang, linking desert oasis to river capitals.",
    stopSlugs: [
      "mogao-caves",
      "yungang",
      "longmen",
      "leshan-buddha",
      "white-horse-temple"
    ],
  },
  {
    slug: "nara-kyoto-ancient",
    name: "Nara & Ancient Capitals",
    kind: "route",
    region: "East Asia",
    tradition: "Mahayana",
    summary:
      "Asuka–Nara foundations of Japanese Buddhism — Hōryū-ji, Tōdai-ji, Byōdō-in, and Mount Hiei.",
    lengthNote: "Kansai temple itinerary · 2–4 days",
    significance:
      "From Japan’s oldest wooden temples to the Great Buddha and Tendai’s mother mountain above Kyoto.",
    stopSlugs: [
      "horyu-ji",
      "todai-ji",
      "byodo-in",
      "enryaku-ji",
      "kyoto-kinkaku"
    ],
  },
  {
    slug: "java-temple-plain",
    name: "Central Java Temple Plain",
    kind: "route",
    region: "Southeast Asia",
    tradition: "Interfaith",
    summary:
      "Hindu–Buddhist sacred plain of Central Java — Borobudur, Mendut, and Prambanan.",
    lengthNote: "Day trips from Yogyakarta",
    significance:
      "UNESCO twin landscapes of Mahayana Borobudur and Hindu Prambanan, with Mendut on the processional approach.",
    stopSlugs: [
      "mendut",
      "borobudur",
      "prambanan"
    ],
  },
  {
    slug: "mekong-theravada",
    name: "Mekong Theravada Shrines",
    kind: "route",
    region: "Southeast Asia",
    tradition: "Theravada",
    summary:
      "Lao and Cambodian Theravada–Mahayana monuments along the Mekong cultural sphere.",
    lengthNote: "Vientiane–Luang Prabang–Angkor itinerary",
    significance:
      "Links Pha That Luang, Luang Prabang’s Wat Xieng Thong, and Angkor’s Bayon and Angkor Wat.",
    stopSlugs: [
      "that-luang",
      "wat-xieng-thong",
      "bayon",
      "angkor-wat"
    ],
  },
  {
    slug: "mongolia-buddhist",
    name: "Mongolian Buddhist Seats",
    kind: "route",
    region: "East Asia",
    tradition: "Tibetan",
    summary:
      "From Karakorum’s Erdene Zuu to Ulaanbaatar’s Gandan — Mongolia’s Tibetan Buddhist revival axis.",
    lengthNote: "Central Mongolia itinerary",
    significance:
      "Erdene Zuu marks the Mongol turn to Tibetan Buddhism; Gandan is today’s living national monastery.",
    stopSlugs: [
      "erdene-zuu",
      "gandan"
    ],
  },
  {
    slug: "eight-great-places",
    name: "Eight Great Places of the Buddha",
    kind: "route",
    region: "India & Nepal",
    tradition: "Buddhist",
    summary:
      "The classical Attha-mahathanani — four life sites plus four miracle places of early Buddhist pilgrimage.",
    lengthNote: "8 sites across Nepal and northern India",
    significance:
      "Beyond the four sites named in the Mahāparinibbāna Sutta, commentarial tradition elevates Shravasti, Rajgir, Sankassa, and Vaishali — completing the Eight Great Places.",
    stopSlugs: [
      "lumbini",
      "bodh-gaya",
      "sarnath",
      "kushinagar",
      "shravasti",
      "rajgir",
      "sankassa",
      "vaishali"
    ],
  },
  {
    slug: "buddhas-walk",
    name: "Buddha’s Walk (Bodh Gaya to Sarnath)",
    kind: "route",
    region: "India & Nepal",
    tradition: "Buddhist",
    summary:
      "Narrative route of the Buddha’s journey from awakening to the first sermon — a reconstructed walking pilgrimage corridor.",
    lengthNote: "~250 km · multi-day walk (fragmented under modern roads)",
    significance:
      "Not a finished official trail product, but a living revival theme linking Mahabodhi with Deer Park; Pragbodhi marks the austerities before enlightenment.",
    stopSlugs: [
      "pragbodhi",
      "bodh-gaya",
      "sarnath"
    ],
  },
  {
    slug: "sapta-puri",
    name: "Sapta Puri (Seven Sacred Cities)",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Seven cities traditionally said to grant moksha — Ayodhya, Mathura, Haridwar, Kashi, Kanchipuram, Ujjain, and Dwarka.",
    lengthNote: "Pan-Indian sacred-city circuit",
    significance:
      "A classical Hindu geography of liberation cities, distinct from Char Dham mountain/coastal abodes.",
    stopSlugs: [
      "ayodhya",
      "mathura",
      "haridwar",
      "varanasi",
      "kanchipuram",
      "ujjain",
      "dwarka"
    ],
  },
  {
    slug: "jyotirlinga-12",
    name: "12 Jyotirlinga Yatra",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Pan-Indian pilgrimage to the twelve Jyotirlingas — self-manifested forms of Shiva as pillars of light.",
    lengthNote: "12 temples across India · often multi-week",
    significance:
      "Recited in the Dwadasha Jyotirlinga stotra; pilgrims may follow stotra order or geographic clusters. Vaidyanath here follows the widely visited Deoghar identification.",
    stopSlugs: [
      "somnath",
      "mallikarjuna",
      "mahakaleshwar",
      "omkareshwar",
      "kedarnath",
      "bhimashankar",
      "varanasi",
      "trimbakeshwar",
      "vaidyanath",
      "nageshwar",
      "rameswaram",
      "grishneshwar"
    ],
  },
  {
    slug: "adi-shakti-peethas",
    name: "Adi Shakti Peethas",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Four foremost Shakti Peethas — Kamakhya, Kalighat, Tara Tarini, and Bimala — a focused entry to the wider Peetha landscape.",
    lengthNote: "4 goddess shrines · eastern India",
    significance:
      "Traditional Adi Peetha subset within the larger (variously counted) Shakti Peetha network spanning South Asia.",
    stopSlugs: [
      "kamakhya",
      "kalighat",
      "tara-tarini",
      "bimala"
    ],
  },
  {
    slug: "pancha-bhoota",
    name: "Pancha Bhoota Stalam",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Five South Indian Shiva temples embodying earth, water, fire, air, and space.",
    lengthNote: "5 temples · Tamil Nadu & Andhra · often 3–5 days",
    significance:
      "Ekambareswarar (earth), Jambukeswarar (water), Arunachaleswarar at Tiruvannamalai (fire), Srikalahasti (air), and Chidambaram Nataraja (space).",
    stopSlugs: [
      "ekambareswarar",
      "jambukeswarar",
      "arunachaleswarar",
      "srikalahasti",
      "chidambaram"
    ],
  },
  {
    slug: "ashta-vinayak",
    name: "Ashta Vinayak Yatra",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Eight sacred Ganesha temples of Maharashtra forming a classic regional circuit.",
    lengthNote: "8 temples · often 2–3 days by road",
    significance:
      "Traditionally begun at Morgaon and completed at Ranjangaon — Maharashtra’s definitive Ganesha pilgrimage.",
    stopSlugs: [
      "morgaon",
      "siddhatek",
      "ballaleshwar-pali",
      "varadvinayak",
      "theur",
      "lenyadri",
      "ozar",
      "ranjangaon"
    ],
  },
  {
    slug: "panch-kedar",
    name: "Panch Kedar",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Five Shiva temples of the Garhwal Himalaya — Kedarnath and its high companion shrines.",
    lengthNote: "5 temples · demanding seasonal treks",
    significance:
      "Kedarnath, Tungnath, Rudranath, Madhyamaheshwar, and Kalpeshwar form a Shaiva mountain circuit older than modern road pilgrimage.",
    stopSlugs: [
      "kedarnath",
      "tungnath",
      "rudranath",
      "madhyamaheshwar",
      "kalpeshwar"
    ],
  },
  {
    slug: "panch-prayag",
    name: "Panch Prayag",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Five sacred Alaknanda confluences of Garhwal — from Vishnuprayag down to Devprayag.",
    lengthNote: "5 sangams along the Char Dham corridor",
    significance:
      "Vishnuprayag, Nandprayag, Karnaprayag, Rudraprayag, and Devprayag map the making of the Ganga.",
    stopSlugs: [
      "vishnuprayag",
      "nandprayag",
      "karnaprayag",
      "rudraprayag",
      "devprayag"
    ],
  },
  {
    slug: "kumbh-cities",
    name: "Kumbh Mela Cities",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Four rotating Kumbh sites on a roughly twelve-year astrological cycle.",
    lengthNote: "4 cities · festival geography (not a walking circuit)",
    significance:
      "Prayagraj, Haridwar, Ujjain, and Nashik–Trimbak receive the Kumbh in turn; UNESCO-recognized intangible heritage.",
    stopSlugs: [
      "prayagraj",
      "haridwar",
      "ujjain",
      "trimbakeshwar"
    ],
  },
  {
    slug: "rama-circuit",
    name: "Rama Circuit (Ramayana Trail)",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Sites of Rama’s life and exile — from Ayodhya through forest tirthas to Rameswaram.",
    lengthNote: "Multi-state Indian itinerary",
    significance:
      "Links Janmabhoomi, Chitrakoot, Prayagraj, Varanasi, Panchavati, and the Setu-shore shrine of Rameswaram.",
    stopSlugs: [
      "ayodhya",
      "chitrakoot",
      "prayagraj",
      "varanasi",
      "panchavati",
      "rameswaram"
    ],
  },
  {
    slug: "braj-krishna",
    name: "Braj Krishna Yatra",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Krishna’s Braj Mandal — Mathura, Vrindavan, Govardhan, and companion towns, with Dwarka and Kurukshetra.",
    lengthNote: "Braj core often 2–4 days (+ optional Dwarka/Kurukshetra)",
    significance:
      "Living bhakti geography of Krishna’s childhood and later life; Govardhan anchors the famous hill parikrama.",
    stopSlugs: [
      "mathura",
      "gokul",
      "vrindavan",
      "govardhan",
      "barsana",
      "dwarka",
      "kurukshetra"
    ],
  },
  {
    slug: "govardhan-parikrama",
    name: "Govardhan Parikrama",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Circumambulation of Govardhan Hill — roughly 21 km walked as worship of Giriraj.",
    lengthNote: "~21 km · often 5–7 hours on foot",
    significance:
      "One of Braj’s great living parikramas; commonly begun near Mansi Ganga or Daan Ghati.",
    stopSlugs: [
      "govardhan",
      "vrindavan",
      "mathura"
    ],
  },
  {
    slug: "narmada-parikrama",
    name: "Narmada Parikrama",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Great river circumambulation of the Narmada — from Amarkantak to the sea and back along the opposite bank.",
    lengthNote: "~2,600–3,200 km · months on foot",
    significance:
      "Among Hinduism’s longest continuous pilgrimages; pilgrims keep the river to the right. This guide maps key anchors including Omkareshwar.",
    stopSlugs: [
      "amarkantak",
      "omkareshwar",
      "maheshwar",
      "bharuch"
    ],
  },
  {
    slug: "manimahesh-yatra",
    name: "Manimahesh Yatra",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Seasonal high-altitude Shiva pilgrimage to Manimahesh Lake beneath Manimahesh Kailash in Chamba.",
    lengthNote: "~14 km trek from Hadsar · Aug/Sep season",
    significance:
      "Himachal state-level yatra often called the Kailash of Himachal; one of the Panch Kailash sacred mountains.",
    stopSlugs: [
      "manimahesh"
    ],
  },
  {
    slug: "divya-desam-highlights",
    name: "Divya Desam Highlights",
    kind: "route",
    region: "India & Nepal",
    tradition: "Hindu",
    summary:
      "Entry route to the 108 Divya Desams — major Vishnu temples praised by the Alvars, spanning India and Nepal.",
    lengthNote: "Curated anchors (full set is 106 earthly + 2 celestial)",
    significance:
      "Phased guide to the Sri Vaishnava circuit: Tirupati, Srirangam-region peers via Kanchi/Dwarka/Badrinath/Mathura/Ayodhya geography, plus Muktinath in Mustang.",
    stopSlugs: [
      "tirupati",
      "kanchipuram",
      "dwarka",
      "badrinath",
      "mathura",
      "ayodhya",
      "muktinath"
    ],
  },
  {
    slug: "arunachal-buddhist",
    name: "Arunachal Buddhist Trail",
    kind: "route",
    region: "Tibet & Himalaya",
    tradition: "Tibetan",
    summary:
      "Himalayan Vajrayana corridor of western Arunachal — Bomdila to Tawang Monastery.",
    lengthNote: "Mountain road itinerary · 2–4 days",
    significance:
      "Key Indian Mahayana–Vajrayana monastic landscape identified on Ministry of Tourism heritage trails.",
    stopSlugs: [
      "bomdila",
      "tawang"
    ],
  }
];

export const PILGRIMAGE_ENTRIES: PilgrimageEntry[] = [
  ...PILGRIMAGE_SITES,
  ...PILGRIMAGE_ROUTES
];

export function getPilgrimageSite(slug: string): PilgrimageSite | undefined {
  return PILGRIMAGE_SITES.find((site) => site.slug === slug);
}

export function getPilgrimageRoute(slug: string): PilgrimageRoute | undefined {
  return PILGRIMAGE_ROUTES.find((route) => route.slug === slug);
}

export function pilgrimageSitePath(slug: string): string {
  return `/pilgrimage/sites/${slug}`;
}

export function pilgrimageRoutePath(slug: string): string {
  return `/pilgrimage/routes/${slug}`;
}

export function getAllPilgrimageSiteSlugs(): string[] {
  return PILGRIMAGE_SITES.map((site) => site.slug);
}

export function getAllPilgrimageRouteSlugs(): string[] {
  return PILGRIMAGE_ROUTES.map((route) => route.slug);
}

/** Ordered pilgrimage sites for a route (skips unknown slugs). */
export function getRouteStopSites(route: PilgrimageRoute): PilgrimageSite[] {
  return route.stopSlugs
    .map((slug) => getPilgrimageSite(slug))
    .filter((site): site is PilgrimageSite => site != null);
}

/** Ordered [lat, lng] pairs for drawing a route polyline. */
export function getRouteLatLngs(route: PilgrimageRoute): [number, number][] {
  return getRouteStopSites(route).map((site) => [site.lat, site.lng]);
}
