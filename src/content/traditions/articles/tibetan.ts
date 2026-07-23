import type { TraditionArticle } from "../types";

const tibetanHero = "/traditions/tibetan.jpg";
const tibetanCredit = {
  name: "Pexels",
  url: "https://www.pexels.com/license/",
};

export const tibetanArticles: TraditionArticle[] = [
  {
    slug: "tibetan",
    heroImage: tibetanHero,
    heroImageCredit: tibetanCredit,
    summary:
      "The Buddhist traditions of Tibet and the Himalayas — combining scholastic study, monastic discipline, and Vajrayāna practice.",
    body: `Tibetan Buddhism developed after Buddhism entered the Tibetan plateau from India and Nepal, especially from the seventh century onward. It preserves Indian Mahāyāna philosophy and the tantric systems known as Vajrayāna, alongside a rich culture of debate, translation, and monastic universities.

The tradition is often organized into major schools — Nyingma, Kagyu, Sakya, and Gelug — with additional movements such as Bon (in its Buddhist-influenced forms), Shambhala, and Diamond Way present in the West. Shared features include guru yoga, deity practice, mantra, and the gradual path from preliminary practices (*ngöndro*) to advanced meditation.

Exile after 1959 carried Tibetan Buddhism worldwide. Today FPMT centers, Karma Kagyu organizations, Nyingma temples, and independent sanghas offer study and practice across North America and Europe.`,
    practices: [
      {
        title: "Ngöndro (preliminary practices)",
        description:
          "Prostrations, Vajrasattva mantra, mandala offerings, and guru yoga that prepare the mind for deeper tantric work.",
      },
      {
        title: "Deity yoga & mantra",
        description:
          "Visualization and recitation practices associated with awakened forms such as Avalokiteśvara, Tārā, and Padmasambhava.",
      },
      {
        title: "Analytical meditation",
        description:
          "Scholastic contemplation of emptiness, dependent arising, and the stages of the path (*lamrim*).",
      },
      {
        title: "Retreat",
        description:
          "Short and long solitary or group retreats, including traditional three-year retreats in some lineages.",
      },
    ],
    texts: [
      {
        title: "The Words of My Perfect Teacher",
        author: "Patrul Rinpoche",
        note: "Classic Nyingma guide to the preliminaries.",
      },
      {
        title: "Liberation in the Palm of Your Hand",
        author: "Pabongka Rinpoche",
        note: "Influential Gelug lamrim presentation.",
      },
      {
        title: "When Things Fall Apart",
        author: "Pema Chödrön",
        note: "Contemporary Kagyu-inspired teachings for daily life.",
        href: "https://www.amazon.com/dp/1611803438",
      },
    ],
    sources: [
      {
        label: "Tibetan Buddhism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Tibetan_Buddhism",
      },
      {
        label: "Vajrayāna — Britannica",
        href: "https://www.britannica.com/topic/Vajrayana",
      },
    ],
  },
  {
    slug: "nyingma",
    heroImage: "/traditions/nyingma.jpg",
    heroImageCredit: tibetanCredit,
    summary:
      "The “ancient” school of Tibetan Buddhism, associated with Padmasambhava, terma revelations, and Dzogchen.",
    body: `Nyingma (*rnying ma*, “ancient”) is regarded as the oldest of Tibet’s major Buddhist schools. It traces its origins to the early dissemination of Buddhism in Tibet and to figures such as Padmasambhava, Śāntarakṣita, and King Trisong Detsen.

Distinctive features include the nine-yāna classification of practice, a strong terma (treasure) tradition of revealed teachings, and Dzogchen — the “Great Perfection” — as a pinnacle path pointing to the natural state of mind. Major Nyingma monasteries historically included Mindrolling, Dorje Drak, and Katok; in the diaspora, centers such as Namdroling and many Western sanghas continue the lineage.`,
    practices: [
      {
        title: "Dzogchen",
        description:
          "Direct introduction to rigpa (awareness) and practices of trekchö and tögal under qualified guidance.",
      },
      {
        title: "Terma practice",
        description:
          "Sadhanas and cycles revealed by tertöns and transmitted through specific treasure lineages.",
      },
      {
        title: "Ngöndro",
        description:
          "Preliminary practices as presented in texts such as *The Words of My Perfect Teacher*.",
      },
    ],
    texts: [
      {
        title: "The Words of My Perfect Teacher",
        author: "Patrul Rinpoche",
      },
      {
        title: "The Tibetan Book of the Dead",
        author: "Various (Bardo Thödol tradition)",
        note: "Famous Nyingma-associated funerary instructions.",
      },
    ],
    sources: [
      {
        label: "Nyingma — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Nyingma",
      },
    ],
  },
  {
    slug: "kagyu",
    heroImage: "/traditions/kagyu.jpg",
    heroImageCredit: tibetanCredit,
    summary:
      "The “oral lineage” school emphasizing mahāmudrā meditation and guru transmission, including Karma Kagyu and related branches.",
    body: `Kagyu (*bka' brgyud*) means “oral lineage.” The school descends from Indian mahāsiddhas such as Tilopa and Nāropa through Marpa the Translator, Milarepa, and Gampopa. Its hallmark is experiential meditation — especially mahāmudrā — transmitted closely from teacher to student.

Major branches include Karma Kagyu (headed by the Karmapa), Drikung, Drukpa, and others. Practice often combines ngöndro, deity yoga (notably Vajrayoginī and Chakrasaṃvara cycles), and mahāmudrā instructions. Western centers associated with Kalu Rinpoche, Chögyam Trungpa, and successive Karmapas have made Kagyu teachings widely available.`,
    practices: [
      {
        title: "Mahāmudrā",
        description:
          "Meditation on the nature of mind, often taught after completion of preliminaries.",
      },
      {
        title: "Six Yogas of Nāropa",
        description:
          "Advanced yogic practices including tummo and dream yoga in traditional curricula.",
      },
      {
        title: "Guru yoga",
        description:
          "Devotional meditation connecting the practitioner with the blessings of the lineage.",
      },
    ],
    texts: [
      {
        title: "The Life of Milarepa",
        author: "Tsangnyön Heruka",
        note: "Foundational hagiography of the great yogin.",
      },
      {
        title: "Mahāmudrā: The Moonlight",
        author: "Dakpo Tashi Namgyal",
      },
    ],
    sources: [
      {
        label: "Kagyu — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Kagyu",
      },
    ],
  },
  {
    slug: "gelug",
    heroImage: "/traditions/gelug.jpg",
    heroImageCredit: tibetanCredit,
    summary:
      "The school founded by Je Tsongkhapa, known for rigorous study, lamrim, and the lineage of the Dalai Lamas.",
    body: `Gelug (*dge lugs*, “virtuous tradition”) was founded by Je Tsongkhapa (1357–1419). It emphasizes monastic discipline, logical debate, and a carefully staged path (*lamrim*) integrating sutra and tantra.

Great monastic universities — Ganden, Sera, and Drepung — became centers of scholastic training. The Dalai Lama institution is historically associated with Gelug, though the office carries broader Tibetan Buddhist significance. Organizations such as FPMT and Jewel Heart have established many Gelug-inspired centers internationally.`,
    practices: [
      {
        title: "Lamrim meditation",
        description:
          "Contemplation of the stages of the path from precious human rebirth to enlightenment.",
      },
      {
        title: "Debate & study",
        description:
          "Training in Madhyamaka, Abhidharma, and epistemology through monastic curricula.",
      },
      {
        title: "Deity practice",
        description:
          "Tantric sādhanas such as Yamāntaka, Guhyasamāja, and Cakrasaṃvara in graduated systems.",
      },
    ],
    texts: [
      {
        title: "The Great Treatise on the Stages of the Path",
        author: "Tsongkhapa",
        note: "The Lamrim Chenmo.",
      },
      {
        title: "Liberation in the Palm of Your Hand",
        author: "Pabongka Rinpoche",
      },
    ],
    sources: [
      {
        label: "Gelug — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Gelug",
      },
    ],
  },
  {
    slug: "sakya",
    heroImage: "/traditions/sakya.jpg",
    heroImageCredit: tibetanCredit,
    summary:
      "A major Tibetan school centered on the Khön family lineage and the Lamdré (“Path and Fruit”) teachings.",
    body: `Sakya (*sa skya*, “pale earth”) takes its name from the landscape around Sakya Monastery in southern Tibet. The school is closely tied to the Khön family and to the Hevajra tantra cycle transmitted as Lamdré — Path with Its Result.

Sakya scholars made major contributions to logic, epistemology, and tantric exegesis. In the thirteenth century, Sakya leaders held significant political influence under Mongol patronage. Today Sakya centers worldwide continue Lamdré teachings under the Sakya Trizin and related masters.`,
    practices: [
      {
        title: "Lamdré",
        description:
          "The comprehensive Path and Fruit system based on the Hevajra tantra.",
      },
      {
        title: "Vajrayoginī & Hevajra practice",
        description:
          "Central deity yogas of the Sakya tradition.",
      },
      {
        title: "Scholastic study",
        description:
          "Training in Madhyamaka and pramāṇa alongside tantric liturgy.",
      },
    ],
    texts: [
      {
        title: "Three Visions",
        author: "Ngawang Donyo Dorje / traditional Lamdré literature",
        note: "Introductory presentation of the Lamdré path.",
      },
      {
        title: "Freeing the Heart and Mind",
        author: "Sakya Trizin / contemporary teachings",
      },
    ],
    sources: [
      {
        label: "Sakya — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Sakya",
      },
    ],
  },
  {
    slug: "bon",
    heroImage: "/traditions/bon.jpg",
    heroImageCredit: tibetanCredit,
    summary:
      "Tibet’s indigenous religious tradition, which developed Buddhist-influenced monastic and Dzogchen streams alongside earlier ritual forms.",
    body: `Bon is often described as Tibet’s pre-Buddhist religion, though modern scholarship shows a complex history of mutual influence with Buddhism. Yungdrung Bon developed monasteries, a canon, and practices — including Dzogchen — that parallel Tibetan Buddhist forms while retaining distinct cosmology and ritual.

Contemporary Bon communities, including centers founded by teachers such as Tenzin Wangyal Rinpoche and others, offer meditation, sound healing, and traditional yogas to Western students while preserving liturgical heritage.`,
    practices: [
      {
        title: "Bon Dzogchen",
        description:
          "Great Perfection practices preserved in Bon lineages such as Zhang Zhung Nyen Gyud.",
      },
      {
        title: "Ritual & offering",
        description:
          "Traditional rites for harmony with spirits and purification.",
      },
      {
        title: "Trul khor & breath",
        description:
          "Yogic movement and breathing practices found in Bon curricula.",
      },
    ],
    texts: [
      {
        title: "Wonders of the Natural Mind",
        author: "Tenzin Wangyal Rinpoche",
      },
      {
        title: "Heart Drops of Dharmakaya",
        author: "Shardza Tashi Gyaltsen",
      },
    ],
    sources: [
      {
        label: "Bon — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Bon",
      },
    ],
  },
  {
    slug: "shambhala",
    heroImage: "/traditions/shambhala.jpg",
    heroImageCredit: tibetanCredit,
    summary:
      "A modern Buddhist-inspired movement rooted in Kagyu and Nyingma streams, presenting a path of “warriorship” and meditation in everyday life.",
    body: `Shambhala Buddhism emerged from the teaching activity of Chögyam Trungpa Rinpoche and later Sakyong Mipham. It blends Kagyu and Nyingma meditation with a secular-facing presentation of basic goodness, mindfulness, and enlightened society.

Centers historically offered sitting meditation, contemplative arts, and the Shambhala Training levels. The community has undergone significant organizational change; independent local sanghas and related lineages continue aspects of the practice in many cities.`,
    practices: [
      {
        title: "Shamatha meditation",
        description:
          "Calm-abiding sitting as the foundation of the path.",
      },
      {
        title: "Shambhala Training",
        description:
          "Progressive programs exploring presence, fearlessness, and society.",
      },
      {
        title: "Contemplative arts",
        description:
          "Ikebana, calligraphy, and other forms used as mindfulness training.",
      },
    ],
    texts: [
      {
        title: "Shambhala: The Sacred Path of the Warrior",
        author: "Chögyam Trungpa",
      },
      {
        title: "Cutting Through Spiritual Materialism",
        author: "Chögyam Trungpa",
      },
    ],
    sources: [
      {
        label: "Shambhala Buddhism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Shambhala_Buddhism",
      },
    ],
  },
  {
    slug: "diamond-way",
    heroImage: "/traditions/diamond-way.jpg",
    heroImageCredit: tibetanCredit,
    summary:
      "A Karma Kagyu lay movement founded by Lama Ole Nydahl, with centers emphasizing meditation on the 16th Karmapa.",
    body: `Diamond Way Buddhism is a lay organization in the Karma Kagyu tradition founded by Lama Ole Nydahl and Hannah Nydahl after receiving teachings from the 16th Karmapa. Centers typically offer guided meditations focused on the Karmapa and accessible introductions to Buddhist view for working adults.

The movement has a large European footprint and a distinctive organizational culture. Practitioners often combine weekly center practice with courses and travel to larger Diamond Way events.`,
    practices: [
      {
        title: "Guru yoga on the 16th Karmapa",
        description:
          "The signature guided meditation practiced in Diamond Way centers.",
      },
      {
        title: "Ngöndro",
        description:
          "Traditional preliminaries offered in course formats for lay practitioners.",
      },
      {
        title: "Lectures & courses",
        description:
          "Introductory talks on Buddhist view, meditation, and daily life.",
      },
    ],
    texts: [
      {
        title: "The Way Things Are",
        author: "Lama Ole Nydahl",
      },
      {
        title: "Buddha & Love",
        author: "Lama Ole Nydahl",
      },
    ],
    sources: [
      {
        label: "Diamond Way Buddhism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Diamond_Way_Buddhism",
      },
    ],
  },
];
