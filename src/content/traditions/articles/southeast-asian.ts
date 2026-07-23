import type { TraditionArticle } from "../types";

const hero = "/traditions/southeast-asian.jpg";
const credit = {
  name: "Pexels",
  url: "https://www.pexels.com/license/",
};

export const southeastAsianArticles: TraditionArticle[] = [
  {
    slug: "southeast-asian",
    heroImage: hero,
    heroImageCredit: credit,
    summary:
      "Temple-centered Buddhist cultures of Thailand, Myanmar, Laos, Cambodia, and Sri Lanka as they live in diaspora communities.",
    body: `“Southeast Asian” Buddhism on Dharma Atlas groups culturally specific Theravāda communities — Thai, Burmese, Lao, Cambodian, and Sri Lankan — whose temples often serve as religious, linguistic, and social hubs for immigrant families.

While doctrine overlaps with broader Theravāda, local liturgy, festivals (Songkran, Vesak, Kathina), food offerings, and language shape daily practice. Many temples welcome visitors for meditation nights and major holidays even when the primary community language is not English.`,
    practices: [
      {
        title: "Temple chanting & offerings",
        description:
          "Morning/evening services, food dana, and festival rituals.",
      },
      {
        title: "Community ceremonies",
        description:
          "Ordinations, funerals, and blessing rites that structure communal life.",
      },
      {
        title: "Lay meditation nights",
        description:
          "Weekly sits offered alongside traditional liturgical calendars.",
      },
    ],
    texts: [
      {
        title: "The Buddhist World of Southeast Asia",
        author: "Donald K. Swearer",
      },
      {
        title: "What the Buddha Taught",
        author: "Walpola Rahula",
      },
    ],
    sources: [
      {
        label: "Buddhism in Southeast Asia — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Buddhism_in_Southeast_Asia",
      },
    ],
  },
  {
    slug: "thai",
    heroImage: "/traditions/thai.jpg",
    heroImageCredit: credit,
    summary:
      "Thai Buddhist temple communities — wat culture, merit-making, and meditation lineages in Thailand and abroad.",
    body: `Thai Buddhism is predominantly Theravāda, organized around the *wat* (temple-monastery) as the heart of village and urban life. Merit-making, monastic support, and festival calendars define much of lay practice, while forest and city meditation lineages offer deeper training.

Thai temples in the diaspora often retain Thai-language services and cultural schools while hosting English meditation groups. Some are connected to Dhammayut or Mahanikai orders; others affiliate with particular ajahns.`,
    practices: [
      {
        title: "Tam bun (merit-making)",
        description:
          "Offerings of food, robes, and support to the monastic Sangha.",
      },
      {
        title: "Wat liturgy",
        description:
          "Pali-Thai chanting for blessings, funerals, and holy days.",
      },
      {
        title: "Meditation with monks",
        description:
          "Breath and insight instructions offered at many city wats.",
      },
    ],
    texts: [
      {
        title: "Thai Buddhism in Everyday Life",
        note: "Ethnographic and introductory surveys of wat culture.",
      },
      {
        title: "Food for the Heart",
        author: "Ajahn Chah",
      },
    ],
    sources: [
      {
        label: "Buddhism in Thailand — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Buddhism_in_Thailand",
      },
    ],
  },
  {
    slug: "burmese",
    heroImage: "/traditions/burmese.jpg",
    heroImageCredit: credit,
    summary:
      "Burmese (Myanmar) Buddhist communities known for intensive vipassanā and vibrant pagoda culture.",
    body: `Myanmar’s Theravāda culture produced influential meditation masters — Ledi Sayadaw, Mahasi Sayadaw, Webu Sayadaw, and others — whose methods shaped global insight practice. Domestic Buddhism also centers on pagodas, ordination, and protective rites.

Burmese temples and monasteries abroad often maintain Burmese-language chanting and community support while sharing vipassanā techniques with wider audiences.`,
    practices: [
      {
        title: "Mahasi noting",
        description:
          "Moment-to-moment labeling of phenomena in sitting and walking.",
      },
      {
        title: "Pagoda devotion",
        description:
          "Circumambulation, offerings, and festival observance.",
      },
      {
        title: "Temporary ordination",
        description:
          "Short-term monastic experience common in Burmese culture.",
      },
    ],
    texts: [
      {
        title: "Practical Insight Meditation",
        author: "Mahasi Sayadaw",
      },
      {
        title: "Manual of Insight",
        author: "Mahasi Sayadaw",
      },
    ],
    sources: [
      {
        label: "Buddhism in Myanmar — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Buddhism_in_Myanmar",
      },
    ],
  },
  {
    slug: "lao",
    heroImage: "/traditions/lao.jpg",
    heroImageCredit: credit,
    summary:
      "Lao Buddhist temple communities preserving language, ritual, and Theravāda practice in Laos and the diaspora.",
    body: `Lao Buddhism is Theravāda with distinctive ritual aesthetics, temple architecture, and spirit-world negotiations alongside monastic vinaya. In diaspora communities, Lao temples are crucial cultural centers for language, festivals, and mutual aid.

Visitors may encounter warm hospitality, food offerings on holy days, and opportunities to sit with monks — even when English teaching is limited.`,
    practices: [
      {
        title: "Boun festivals",
        description:
          "Merit festivals and seasonal celebrations structuring the year.",
      },
      {
        title: "Alms & temple support",
        description:
          "Daily or weekly dana sustaining resident monastics.",
      },
      {
        title: "Blessing rites",
        description:
          "Water blessings and protective ceremonies for families.",
      },
    ],
    texts: [
      {
        title: "The Lao Buddhism of Luang Prabang",
        note: "Cultural histories of Lao religious life.",
      },
    ],
    sources: [
      {
        label: "Buddhism in Laos — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Buddhism_in_Laos",
      },
    ],
  },
  {
    slug: "cambodian",
    heroImage: "/traditions/cambodian.jpg",
    heroImageCredit: credit,
    summary:
      "Khmer Buddhist temples — resilience after war, rich ritual life, and community rebuilding in Cambodia and abroad.",
    body: `Cambodian Theravāda was devastated under the Khmer Rouge and has since been rebuilt through temple restoration and diaspora support. Khmer temples emphasize chanting, ordination, and ancestral rites, with meditation offerings varying by monastery.

In North America and Europe, Cambodian wats often function as community hubs — language schools, elder care, and festival grounds — while welcoming guests to major ceremonies.`,
    practices: [
      {
        title: "Pali-Khmer chanting",
        description:
          "Liturgical recitation for protection and merit.",
      },
      {
        title: "Kathina & robe offering",
        description:
          "Annual ceremonies supporting the monastic community.",
      },
      {
        title: "Memorial rites",
        description:
          "Ceremonies for the deceased that bind families to the temple.",
      },
    ],
    texts: [
      {
        title: "Cambodian Buddhism: History and Practice",
        author: "Ian Harris",
      },
    ],
    sources: [
      {
        label: "Buddhism in Cambodia — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Buddhism_in_Cambodia",
      },
    ],
  },
  {
    slug: "sri-lankan",
    heroImage: "/traditions/sri-lankan.jpg",
    heroImageCredit: credit,
    summary:
      "Sinhalese Theravāda communities with deep Pali scholarship, pilgrimage culture, and diaspora temples.",
    body: `Sri Lanka preserved the Pali Canon through centuries of monastic scholarship and became a reference point for Theravāda revival movements. Island Buddhism features pilgrimage sites (Anuradhapura, Kandy’s Temple of the Tooth), meditation hermitages, and strong lay societies.

Sri Lankan temples abroad often offer Pali classes, Bodhi pujas, and meditation programs in English and Sinhala.`,
    practices: [
      {
        title: "Bodhi puja",
        description:
          "Devotional practice at the Bodhi tree with offerings and chants.",
      },
      {
        title: "Pali study",
        description:
          "Canonical language learning tied to sutta reading.",
      },
      {
        title: "Meditation hermitage practice",
        description:
          "Retreats in forest or urban centers following classical methods.",
      },
    ],
    texts: [
      {
        title: "What the Buddha Taught",
        author: "Walpola Rahula",
      },
      {
        title: "The Buddha and His Teachings",
        author: "Narada Thera",
      },
    ],
    sources: [
      {
        label: "Buddhism in Sri Lanka — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Buddhism_in_Sri_Lanka",
      },
    ],
  },
];
