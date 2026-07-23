import type { TraditionArticle } from "../types";

const zenHero = "/traditions/zen.jpg";
const zenCredit = {
  name: "Pexels",
  url: "https://www.pexels.com/license/",
};

export const zenArticles: TraditionArticle[] = [
  {
    slug: "zen",
    heroImage: zenHero,
    heroImageCredit: zenCredit,
    summary:
      "Meditation traditions descending from Chinese Chan — including Japanese Zen, Korean Sŏn, and Vietnamese Thiền.",
    body: `Zen is the Japanese reading of Chinese *Chan* (禪), itself from Sanskrit *dhyāna* — meditation. The tradition emphasizes direct experience of mind through seated meditation (*zazen*), encounter dialogue, and everyday activity as practice.

Chan flourished in Tang and Song China and spread to Korea (Sŏn), Vietnam (Thiền), and Japan (Zen). Japanese schools such as Sōtō and Rinzai shaped much of how Zen is known in the West, though Chinese, Korean, and Vietnamese lineages are equally vital. Hallmarks include silent illumination, kōan introspection, and a suspicion of mere intellectualism without embodied realization.

Western Zen includes large residential centers, small sitting groups, and hybrid sanghas. Related pages cover Sōtō, Rinzai, Ōbaku, Chan, Sŏn, Thiền, Sanbō Zen, and Dharma Drum.`,
    practices: [
      {
        title: "Zazen / sitting meditation",
        description:
          "Upright seated practice — shikantaza (“just sitting”) or breath-counting — as the core discipline.",
      },
      {
        title: "Kōan practice",
        description:
          "Working with paradoxical cases under a teacher’s guidance, especially in Rinzai-derived lines.",
      },
      {
        title: "Kinhin & work practice",
        description:
          "Walking meditation and mindful labor that extend awakening into daily activity.",
      },
      {
        title: "Sesshin",
        description:
          "Intensive multi-day retreats with long sitting schedules and oryoki meals.",
      },
    ],
    texts: [
      {
        title: "Zen Mind, Beginner's Mind",
        author: "Shunryu Suzuki",
        href: "https://www.amazon.com/dp/1590308492",
      },
      {
        title: "The Platform Sutra",
        author: "Huineng (attr.)",
        note: "Foundational Chan scripture.",
      },
      {
        title: "Moon in a Dewdrop",
        author: "Dōgen (ed. Kazuaki Tanahashi)",
      },
    ],
    sources: [
      {
        label: "Zen — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Zen",
      },
      {
        label: "Japanese Zen — Stanford Encyclopedia",
        href: "https://plato.stanford.edu/entries/japanese-zen/",
      },
    ],
  },
  {
    slug: "soto",
    heroImage: "/traditions/soto.jpg",
    heroImageCredit: zenCredit,
    summary:
      "The Japanese Zen school of Dōgen and Keizan, centered on shikantaza — “just sitting.”",
    body: `Sōtō Zen was transmitted to Japan by Eihei Dōgen (1200–1253) and later organized by Keizan Jōkin. Its signature practice is shikantaza: objectless sitting that trusts Buddha-nature as already present rather than chasing special states.

Sōtō became Japan’s largest Zen school, with deep roots in parish temples and mountain monasteries such as Eihei-ji and Sōji-ji. In the West, Shunryu Suzuki, Taizan Maezumi, and others founded major centers (SFZC, ZCLA, White Plum sanghas) that still shape American Zen.`,
    practices: [
      {
        title: "Shikantaza",
        description:
          "Open awareness sitting without a meditation object or gain-seeking agenda.",
      },
      {
        title: "Oryoki & monastic forms",
        description:
          "Formal eating and temple routines that embody mindfulness.",
      },
      {
        title: "Genjōkōan study",
        description:
          "Engaging Dōgen’s writings as contemplative texts, not only philosophy.",
      },
    ],
    texts: [
      {
        title: "Shōbōgenzō",
        author: "Eihei Dōgen",
      },
      {
        title: "Zen Mind, Beginner's Mind",
        author: "Shunryu Suzuki",
        href: "https://www.amazon.com/dp/1590308492",
      },
    ],
    sources: [
      {
        label: "Sōtō — Wikipedia",
        href: "https://en.wikipedia.org/wiki/S%C5%8Dt%C5%8D",
      },
    ],
  },
  {
    slug: "rinzai",
    heroImage: "/traditions/rinzai.jpg",
    heroImageCredit: zenCredit,
    summary:
      "The Japanese Zen school associated with kōan training and dynamic interview with a teacher.",
    body: `Rinzai Zen traces to the Chinese Linji line and was established in Japan by figures such as Eisai and later revitalized by Hakuin Ekaku. Practice typically combines zazen with systematic kōan curricula and intense dokusan (private interview).

Rinzai monasteries historically trained samurai elites as well as monastics. In the West, teachers in the Hakuin line and related temples (including some Midwestern and West Coast monasteries) continue kōan practice for lay and ordained students.`,
    practices: [
      {
        title: "Kōan introspection",
        description:
          "Working through cases such as Mu under a teacher’s examination.",
      },
      {
        title: "Dokusan",
        description:
          "Private interview that tests and guides the student’s insight.",
      },
      {
        title: "Zen arts",
        description:
          "Calligraphy, archery, and other forms historically linked with Rinzai culture.",
      },
    ],
    texts: [
      {
        title: "The Gateless Gate (Mumonkan)",
        author: "Wumen Huikai",
      },
      {
        title: "Wild Ivy",
        author: "Hakuin Ekaku",
        note: "Autobiographical teachings of the Rinzai reformer.",
      },
    ],
    sources: [
      {
        label: "Rinzai — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Rinzai_school",
      },
    ],
  },
  {
    slug: "obaku",
    heroImage: "/traditions/obaku.jpg",
    heroImageCredit: zenCredit,
    summary:
      "A smaller Japanese Zen school of Ming Chinese origin, blending Zen with Pure Land elements.",
    body: `Ōbaku Zen arrived in Japan in the seventeenth century with the Chinese monk Yinyuan Longqi (Ingen). It preserves Ming-dynasty monastic forms, Chinese liturgical chanting, and a greater openness to nembutsu alongside zazen.

Though smaller than Sōtō and Rinzai, Ōbaku contributed significantly to Japanese cultural life, calligraphy, and temple architecture — notably Manpuku-ji near Kyoto.`,
    practices: [
      {
        title: "Zazen with Chinese liturgy",
        description:
          "Sitting practice framed by Ming-style chanting and temple forms.",
      },
      {
        title: "Nembutsu",
        description:
          "Recitation of Amitābha’s name as practiced within Ōbaku settings.",
      },
    ],
    texts: [
      {
        title: "Obaku Zen: The Emergence of the Third Sect of Zen in Tokugawa Japan",
        author: "Helen J. Baroni",
        note: "Scholarly history of the school.",
      },
    ],
    sources: [
      {
        label: "Ōbaku — Wikipedia",
        href: "https://en.wikipedia.org/wiki/%C5%8Cbaku",
      },
    ],
  },
  {
    slug: "chan",
    heroImage: "/traditions/chan.jpg",
    heroImageCredit: {
      name: "Pexels",
      url: "https://www.pexels.com/license/",
    },
    summary:
      "Chinese meditation Buddhism — the root of Zen — spanning classical masters to modern temples worldwide.",
    body: `Chan Buddhism developed in China from the fifth century onward, flowering with figures such as Huineng, Mazu, and Linji. It stressed “a special transmission outside the scriptures,” sudden awakening, and meditation integrated with ordinary life.

Modern Chan includes large institutions such as Dharma Drum, Fo Guang Shan, and Chung Tai, as well as classical monastery lineages. Chinese-language temples across the diaspora remain among the most active Buddhist communities in many Western cities.`,
    practices: [
      {
        title: "Huatou / kōan-style inquiry",
        description:
          "Investigating a critical phrase to cut through discursive thought.",
      },
      {
        title: "Silent illumination",
        description:
          "Calm, clear sitting associated with Caodong/Sōtō-style Chan.",
      },
      {
        title: "Recitation & liturgy",
        description:
          "Morning and evening services that structure temple life.",
      },
    ],
    texts: [
      {
        title: "The Platform Sutra of the Sixth Patriarch",
        author: "Huineng (attr.)",
      },
      {
        title: "The Way of Chan",
        author: "Modern anthologies / Sheng Yen’s teachings",
      },
    ],
    sources: [
      {
        label: "Chan Buddhism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Chan_Buddhism",
      },
    ],
  },
  {
    slug: "son",
    heroImage: "/traditions/son.jpg",
    heroImageCredit: zenCredit,
    summary:
      "Korean Sŏn Buddhism, known for hwadu meditation and the global Kwan Um School of Zen.",
    body: `Sŏn is the Korean form of Chan. Medieval masters such as Chinul integrated scriptural study with sudden awakening, while later traditions emphasized hwadu — intense questioning of a key phrase.

In the modern period, Seung Sahn brought Korean Sŏn to the West through the Kwan Um School, with its distinctive teaching style, kong-an interviews, and “don’t know” mind. Korean temples in North America also serve immigrant communities with a full liturgical calendar.`,
    practices: [
      {
        title: "Hwadu meditation",
        description:
          "Holding a great doubt around a critical phrase until insight breaks through.",
      },
      {
        title: "Kong-an interviews",
        description:
          "Teacher-student encounters testing the student’s response.",
      },
      {
        title: "Bowing practice",
        description:
          "Prostrations used extensively in Korean monastic and lay training.",
      },
    ],
    texts: [
      {
        title: "The Compass of Zen",
        author: "Seung Sahn",
      },
      {
        title: "Tracing Back the Radiance",
        author: "Chinul (tr. Robert Buswell)",
      },
    ],
    sources: [
      {
        label: "Korean Seon — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Korean_Seon",
      },
    ],
  },
  {
    slug: "thien",
    heroImage: "/traditions/thien.jpg",
    heroImageCredit: {
      name: "Pexels",
      url: "https://www.pexels.com/license/",
    },
    summary:
      "Vietnamese Thiền — Zen in a Vietnamese key — including the engaged Buddhism of Thich Nhat Hanh.",
    body: `Thiền is Vietnamese Zen, historically intertwined with Pure Land devotion and Vietnamese cultural forms. In the twentieth century, Thich Nhat Hanh’s Order of Interbeing brought mindfulness, engaged ethics, and gentle Thiền practice to a global audience.

Vietnamese temples worldwide often combine sitting meditation with chanting, ancestral rites, and community festivals. Plum Village and related centers emphasize breathing, walking meditation, and peace work.`,
    practices: [
      {
        title: "Mindful breathing",
        description:
          "Simple awareness of in-breath and out-breath as taught in Plum Village.",
      },
      {
        title: "Walking meditation",
        description:
          "Slow, coordinated steps that make every path a practice hall.",
      },
      {
        title: "Engaged practice",
        description:
          "Bringing mindfulness into social service, peace work, and daily speech.",
      },
    ],
    texts: [
      {
        title: "The Miracle of Mindfulness",
        author: "Thich Nhat Hanh",
        href: "https://www.amazon.com/dp/0807012394",
      },
      {
        title: "Peace Is Every Step",
        author: "Thich Nhat Hanh",
      },
    ],
    sources: [
      {
        label: "Thiền — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Thi%E1%BB%81n",
      },
    ],
  },
  {
    slug: "sanbo-zen",
    heroImage: "/traditions/sanbo-zen.jpg",
    heroImageCredit: zenCredit,
    summary:
      "A modern Japanese Zen lineage integrating Sōtō and Rinzai elements, influential in the West via the Diamond Sangha.",
    body: `Sanbō Zen (formerly Sanbō Kyōdan) was founded by Yasutani Hakuun and developed by Yamada Koun. It combines Sōtō-style shikantaza with a Rinzai-inspired kōan curriculum and has been especially open to lay and non-Japanese practitioners.

Through students such as Robert Aitken and Philip Kapleau, Sanbō-related teaching shaped much of North American Zen. Independent Diamond Sangha and affiliated groups continue the approach of rigorous kōan work within lay life.`,
    practices: [
      {
        title: "Integrated kōan curriculum",
        description:
          "Progressive cases taught alongside everyday lay practice.",
      },
      {
        title: "Shikantaza",
        description:
          "Objectless sitting as both foundation and fruition.",
      },
    ],
    texts: [
      {
        title: "The Three Pillars of Zen",
        author: "Philip Kapleau",
      },
      {
        title: "Taking the Path of Zen",
        author: "Robert Aitken",
      },
    ],
    sources: [
      {
        label: "Sanbo Kyodan — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Sanbo_Kyodan",
      },
    ],
  },
  {
    slug: "dharma-drum",
    heroImage: "/traditions/dharma-drum.jpg",
    heroImageCredit: {
      name: "Pexels",
      url: "https://www.pexels.com/license/",
    },
    summary:
      "A modern Chan organization founded by Master Sheng Yen, teaching huatou and silent illumination worldwide.",
    body: `Dharma Drum Mountain was founded by Chan Master Sheng Yen (1931–2009). It presents Chinese Chan for contemporary practitioners through retreats, education, and environmental and cultural programs.

Signature methods include huatou investigation and silent illumination (mozhao), taught in graduated retreat formats. Dharma Drum centers and affiliates operate across Taiwan, North America, and Europe.`,
    practices: [
      {
        title: "Huatou retreat",
        description:
          "Intensive questioning practice under Chan teachers.",
      },
      {
        title: "Silent illumination",
        description:
          "Calm, luminous sitting without forcing a breakthrough.",
      },
      {
        title: "Protecting the spiritual environment",
        description:
          "Sheng Yen’s framing of ethics, ecology, and mental clarity as one path.",
      },
    ],
    texts: [
      {
        title: "Faith in Mind",
        author: "Sheng Yen (commentary)",
      },
      {
        title: "Hoofprint of the Ox",
        author: "Sheng Yen",
      },
    ],
    sources: [
      {
        label: "Dharma Drum Mountain — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Dharma_Drum_Mountain",
      },
    ],
  },
];
