import type { TraditionArticle } from "../types";

const pureLandHero = "/traditions/pure-land.jpg";
const mahayanaHero = "/traditions/mahayana.jpg";
const wonHero = "/traditions/won-buddhism.jpg";
const credit = {
  name: "Pexels",
  url: "https://www.pexels.com/license/",
};

export const pureLandWonMahayanaArticles: TraditionArticle[] = [
  {
    slug: "pure-land",
    heroImage: pureLandHero,
    heroImageCredit: credit,
    summary:
      "Devotional Mahāyāna traditions centered on Amitābha Buddha and birth in the Pure Land through faith and recitation.",
    body: `Pure Land Buddhism focuses on Amitābha (Amida) Buddha and the vow that beings who entrust themselves and recite the name can be born in Sukhāvatī, the Land of Bliss. The path emphasizes faith, vow, and practice (*nenbutsu* / *nianfo*) accessible to laypeople.

Forms include Chinese Pure Land, Japanese Jōdo Shū and Jōdo Shinshū, and modern movements such as Soka Gakkai (Nichiren-based but often listed near East Asian lay Buddhism in directories). Temples combine chanting services with community life and, in Shin Buddhism, a distinctive theology of other-power (*tariki*).`,
    practices: [
      {
        title: "Nembutsu / nianfo",
        description:
          "Recitation of Amitābha’s name as the central practice.",
      },
      {
        title: "Faith & vow",
        description:
          "Entrusting mind (*shinjin*) in Shinran’s teaching; aspiration for rebirth in the Pure Land.",
      },
      {
        title: "Temple services",
        description:
          "Congregational chanting, memorial rites, and study classes.",
      },
    ],
    texts: [
      {
        title: "The Three Pure Land Sutras",
        note: "Shorter/Longer Sukhāvatīvyūha and Amitāyur-dhyāna.",
      },
      {
        title: "Tannishō",
        author: "Yuien (Shinran tradition)",
      },
    ],
    sources: [
      {
        label: "Pure Land Buddhism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Pure_Land_Buddhism",
      },
    ],
  },
  {
    slug: "soka-gakkai",
    heroImage: "/traditions/soka-gakkai.jpg",
    heroImageCredit: credit,
    summary:
      "A global lay Buddhist movement practicing Nichiren’s chanting of the Lotus Sutra’s daimoku.",
    body: `Soka Gakkai International (SGI) is a lay organization practicing Nichiren Buddhism. Members chant *Nam-myoho-renge-kyo* before the Gohonzon, study the Lotus Sutra tradition as interpreted by Nichiren, and emphasize peace, culture, and education.

Though doctrinally Nichiren rather than Pure Land, SGI centers are often encountered alongside East Asian lay temples in community directories. Local districts host discussion meetings and chanting sessions open to guests.`,
    practices: [
      {
        title: "Daimoku",
        description:
          "Chanting Nam-myoho-renge-kyo as the primary practice.",
      },
      {
        title: "Gongyo",
        description:
          "Recitation of portions of the Lotus Sutra morning and evening.",
      },
      {
        title: "Discussion meetings",
        description:
          "Small-group gatherings for study, encouragement, and community.",
      },
    ],
    texts: [
      {
        title: "The Lotus Sutra",
        note: "Central scripture of the Nichiren tradition.",
      },
      {
        title: "The Writings of Nichiren Daishonin",
        author: "Nichiren",
      },
    ],
    sources: [
      {
        label: "Soka Gakkai — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Soka_Gakkai",
      },
    ],
  },
  {
    slug: "jodo-shin",
    heroImage: "/traditions/jodo-shin.jpg",
    heroImageCredit: credit,
    summary:
      "True Pure Land Buddhism (Jōdo Shinshū) founded by Shinran — centered on entrusting faith in Amida’s vow.",
    body: `Jōdo Shinshū, founded by Shinran (1173–1263), teaches that liberation comes through *shinjin* — entrusting heart — in Amida Buddha’s Primal Vow, rather than through self-powered calculation. The nembutsu is understood as the natural expression of that faith.

Hongwanji branches (Nishi and Higashi) shaped Japanese religious life for centuries. In North America, Buddhist Churches of America and related temples serve both Japanese-American communities and newcomers with English services.`,
    practices: [
      {
        title: "Nembutsu of gratitude",
        description:
          "Saying Amida’s name as thanksgiving rather than merit accumulation.",
      },
      {
        title: "Dharma services",
        description:
          "Sunday services with chanting, sermons, and community fellowship.",
      },
      {
        title: "Study of Shinran",
        description:
          "Reading Tannishō and Kyōgyōshinshō in temple classes.",
      },
    ],
    texts: [
      {
        title: "Tannishō",
        author: "Yuien",
      },
      {
        title: "River of Fire, River of Water",
        author: "Taitetsu Unno",
      },
    ],
    sources: [
      {
        label: "Jōdo Shinshū — Wikipedia",
        href: "https://en.wikipedia.org/wiki/J%C5%8Ddo_Shinsh%C5%AB",
      },
    ],
  },
  {
    slug: "jodo-shu",
    heroImage: "/traditions/jodo-shu.jpg",
    heroImageCredit: credit,
    summary:
      "The Pure Land school founded by Hōnen, emphasizing wholehearted nembutsu practice.",
    body: `Jōdo Shū was founded by Hōnen (1133–1212), who taught exclusive nembutsu practice as the path suited to the age of declining Dharma. Unlike Shinran’s later emphasis on entrusting alone, Hōnen’s school retains a stronger sense of recitation as dedicated practice while remaining centered on Amida’s compassion.

Jōdo Shū temples continue in Japan and in smaller overseas communities, with chanting-focused liturgy and memorial rites.`,
    practices: [
      {
        title: "Exclusive nembutsu",
        description:
          "Dedicated recitation of Amida’s name as the chosen practice.",
      },
      {
        title: "Temple liturgy",
        description:
          "Formal services for the living and the deceased.",
      },
    ],
    texts: [
      {
        title: "Senchakushū",
        author: "Hōnen",
        note: "Hōnen’s collection on the nembutsu path.",
      },
    ],
    sources: [
      {
        label: "Jōdo-shū — Wikipedia",
        href: "https://en.wikipedia.org/wiki/J%C5%8Ddo-sh%C5%AB",
      },
    ],
  },
  {
    slug: "won",
    heroImage: wonHero,
    heroImageCredit: credit,
    summary:
      "Won Buddhism — a modern Korean tradition integrating meditation, ethics, and social engagement around the Il-Won symbol.",
    body: `Won Buddhism was founded in Korea by Sotaesan (Park Chungbin, 1891–1943). It presents a modernized Buddhist path organized around Il-Won (“One Circle”), emphasizing meditation, mindful living, and practical ethics for lay society.

Won temples teach sitting meditation, scripture study from the Won Buddhist canon, and community service. The tradition has centers in Korea and abroad, often welcoming newcomers with clear introductory programs.`,
    practices: [
      {
        title: "Sitting meditation",
        description:
          "Daily practice aimed at recovering the original mind.",
      },
      {
        title: "Timeless Zen in daily life",
        description:
          "Applying mindfulness to work, family, and civic life.",
      },
      {
        title: "Scripture study",
        description:
          "Reading the *Scripture of the Founding Master* and related texts.",
      },
    ],
    texts: [
      {
        title: "The Scriptures of Won-Buddhism",
        note: "Primary canon of the tradition.",
      },
    ],
    sources: [
      {
        label: "Won Buddhism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Won_Buddhism",
      },
    ],
  },
  {
    slug: "mahayana",
    heroImage: mahayanaHero,
    heroImageCredit: credit,
    summary:
      "The Great Vehicle — Buddhist traditions emphasizing the bodhisattva path, emptiness, and universal liberation.",
    body: `Mahāyāna (“Great Vehicle”) names a vast family of Buddhist movements that developed in India and flourished across Central and East Asia. Distinctive themes include the bodhisattva vow to liberate all beings, the perfection of wisdom (*prajñāpāramitā*), and philosophical schools such as Madhyamaka and Yogācāra.

Zen, Pure Land, Nichiren, and Tibetan Buddhism all inherit Mahāyāna frameworks even as they diverge in method. On Dharma Atlas, the Mahāyāna page gathers places and teachers tagged at this broad level when a more specific school is not assigned.`,
    practices: [
      {
        title: "Bodhisattva precepts",
        description:
          "Vows and ethical trainings oriented toward universal compassion.",
      },
      {
        title: "Prajñāpāramitā contemplation",
        description:
          "Meditation and study on emptiness and the perfection of wisdom.",
      },
      {
        title: "Six perfections",
        description:
          "Generosity, ethics, patience, energy, meditation, and wisdom as a path structure.",
      },
    ],
    texts: [
      {
        title: "The Heart Sutra",
        note: "Concise prajñāpāramitā scripture.",
      },
      {
        title: "The Lotus Sutra",
        note: "Central Mahāyāna scripture of the One Vehicle.",
      },
      {
        title: "The Way of the Bodhisattva",
        author: "Śāntideva",
      },
    ],
    sources: [
      {
        label: "Mahayana — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Mahayana",
      },
      {
        label: "Mahayana — Stanford Encyclopedia",
        href: "https://plato.stanford.edu/entries/mahayana/",
      },
    ],
  },
];
