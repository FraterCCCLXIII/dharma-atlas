import type { TraditionArticle } from "../types";

const credit = {
  name: "Pexels",
  url: "https://www.pexels.com/license/",
};

export const otherTraditionArticles: TraditionArticle[] = [
  {
    slug: "non-dualism",
    heroImage: "/traditions/non-dualism.jpg",
    heroImageCredit: credit,
    summary:
      "Contemporary nondual teachings pointing to awareness beyond the subject–object split, drawing on Advaita, Zen, and related streams.",
    body: `Nondualism, as a modern spiritual category, gathers teachers and communities who emphasize the immediacy of awareness and the illusory nature of a separate self. Sources include classical Advaita Vedānta, Dzogchen and Mahāmudrā, Zen, and twentieth-century figures who translated these insights for global audiences.

Practice styles range from self-inquiry and open awareness to satsang dialogue. Dharma Atlas lists nondual teachers and gathering places when communities self-identify with this stream alongside or beyond a single traditional school.`,
    practices: [
      {
        title: "Self-inquiry",
        description:
          "Questioning the sense of “I” until identification softens (Ramana-inspired methods).",
      },
      {
        title: "Open awareness",
        description:
          "Resting as awareness without manipulating experience.",
      },
      {
        title: "Satsang",
        description:
          "Gatherings for teaching, silence, and inquiry with a guide.",
      },
    ],
    texts: [
      {
        title: "I Am That",
        author: "Nisargadatta Maharaj",
      },
      {
        title: "Be As You Are",
        author: "Ramana Maharshi (ed. David Godman)",
      },
    ],
    sources: [
      {
        label: "Nondualism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Nondualism",
      },
    ],
  },
  {
    slug: "advaita-vedanta",
    heroImage: "/traditions/advaita-vedanta.jpg",
    heroImageCredit: credit,
    summary:
      "The nondual school of Vedānta associated with Śaṅkara — teaching the identity of Ātman and Brahman.",
    body: `Advaita Vedānta is a major Hindu philosophical tradition teaching that the innermost Self (Ātman) is not other than ultimate reality (Brahman). Śaṅkara (c. eighth century) systematized earlier Upaniṣadic insights through commentaries and a monastic teaching lineage.

Practice includes scriptural study (*śravaṇa*), reflection (*manana*), and deep contemplation (*nididhyāsana*), often alongside meditation and renunciation. Modern teachers from Ramana Maharshi to contemporary Vedānta societies continue to present Advaita for householders and monks alike.`,
    practices: [
      {
        title: "Śravaṇa–manana–nididhyāsana",
        description:
          "Hearing, reflecting on, and contemplating the mahāvākyas of the Upaniṣads.",
      },
      {
        title: "Self-inquiry (ātma-vichāra)",
        description:
          "Tracing the “I”-thought to its source, as emphasized by Ramana Maharshi.",
      },
      {
        title: "Meditation & japa",
        description:
          "Quiet sitting and mantra repetition supporting discrimination (viveka).",
      },
    ],
    texts: [
      {
        title: "Upaniṣads",
        note: "Foundational nondual scriptures of Vedānta.",
      },
      {
        title: "Crest-Jewel of Discrimination",
        author: "Śaṅkara (attr.)",
      },
      {
        title: "I Am That",
        author: "Nisargadatta Maharaj",
      },
    ],
    sources: [
      {
        label: "Advaita Vedanta — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Advaita_Vedanta",
      },
      {
        label: "Advaita Vedānta — Stanford Encyclopedia",
        href: "https://plato.stanford.edu/entries/advaita-vedanta/",
      },
    ],
  },
  {
    slug: "sufi",
    heroImage: "/traditions/sufi.jpg",
    heroImageCredit: credit,
    summary:
      "Islamic mystical paths of love, remembrance (dhikr), and proximity to the Divine through lineage orders.",
    body: `Sufism (*taṣawwuf*) names the interior dimensions of Islam — purification of the heart, remembrance of God (*dhikr*), and ethical refinement under a guide (*shaykh*). Historic orders (Qadiriyya, Mevlevi, Naqshbandi, Chishti, and many others) developed distinctive liturgies, poetry, and music.

Contemporary Sufi communities range from traditional tarīqas to universalist circles influenced by teachers such as Hazrat Inayat Khan. Practice may include silent or vocal dhikr, whirling, poetry, and service.`,
    practices: [
      {
        title: "Dhikr",
        description:
          "Remembrance of the Divine Names through breath, sound, or silent repetition.",
      },
      {
        title: "Sohbet & companionship",
        description:
          "Spiritual conversation and community under a teacher’s guidance.",
      },
      {
        title: "Sacred movement & music",
        description:
          "Whirling, qawwali, and other forms that open the heart.",
      },
    ],
    texts: [
      {
        title: "The Essential Rumi",
        author: "Jalaluddin Rumi (tr. Coleman Barks et al.)",
      },
      {
        title: "The Conference of the Birds",
        author: "Farid ud-Din Attar",
      },
    ],
    sources: [
      {
        label: "Sufism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Sufism",
      },
      {
        label: "Sufism — Britannica",
        href: "https://www.britannica.com/topic/Sufism",
      },
    ],
  },
  {
    slug: "contemplative-christian",
    heroImage: "/traditions/contemplative-christian.jpg",
    heroImageCredit: credit,
    summary:
      "Christian contemplative streams — centering prayer, monastic silence, and mystical theology in dialogue with meditation.",
    body: `Contemplative Christianity includes desert monasticism, medieval mystics, Carmelite prayer, Hesychasm, and modern renewals such as Centering Prayer and the World Community for Christian Meditation. The emphasis is silent openness to God rather than discursive thought alone.

Many contemporary contemplative centers welcome interfaith practitioners while remaining rooted in Christian scripture and liturgy. Practices often complement — rather than replace — communal worship.`,
    practices: [
      {
        title: "Centering Prayer",
        description:
          "A method of silent consent to God’s presence, popularized by Thomas Keating and others.",
      },
      {
        title: "Jesus Prayer / Hesychasm",
        description:
          "Repetition of a short prayer with the breath in Eastern Christian tradition.",
      },
      {
        title: "Lectio divina",
        description:
          "Slow, prayerful reading of scripture that ripens into contemplation.",
      },
    ],
    texts: [
      {
        title: "Open Mind, Open Heart",
        author: "Thomas Keating",
      },
      {
        title: "The Cloud of Unknowing",
        author: "Anonymous (14th c.)",
      },
      {
        title: "The Interior Castle",
        author: "Teresa of Ávila",
      },
    ],
    sources: [
      {
        label: "Christian contemplation — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Christian_contemplation",
      },
      {
        label: "Centering Prayer — Contemplative Outreach",
        href: "https://www.contemplativeoutreach.org/",
      },
    ],
  },
  {
    slug: "hindu",
    heroImage: "/traditions/hindu.jpg",
    heroImageCredit: credit,
    summary:
      "Hindu traditions of yoga, devotion, and philosophy — from temple ritual to meditation lineages worldwide.",
    body: `Hinduism encompasses diverse practices and philosophies — temple pūjā, bhakti devotion, yoga and meditation, Vedānta, Tantra, and more — oriented around dharma, liberation (*mokṣa*), and relationship with the sacred. There is no single founder or creed; living lineages and local temples carry the tradition.

On Dharma Atlas, Hindu listings include ashrams, temples, and teachers spanning classical and modern movements. Related pages such as Advaita Vedānta go deeper into specific schools.`,
    practices: [
      {
        title: "Pūjā & temple worship",
        description:
          "Offerings, mantra, and darśan in temple and home shrines.",
      },
      {
        title: "Yoga & meditation",
        description:
          "Āsana, prāṇāyāma, and dhyāna as paths of discipline and insight.",
      },
      {
        title: "Bhakti",
        description:
          "Devotional singing, mantra japa, and love of a chosen deity.",
      },
      {
        title: "Scriptural study",
        description:
          "Engaging Bhagavad Gītā, Upaniṣads, and Purāṇic narratives.",
      },
    ],
    texts: [
      {
        title: "Bhagavad Gītā",
        note: "Dialogue on duty, devotion, and liberation.",
      },
      {
        title: "The Upaniṣads",
        note: "Philosophical heart of Vedānta.",
      },
      {
        title: "Autobiography of a Yogi",
        author: "Paramahansa Yogananda",
      },
    ],
    sources: [
      {
        label: "Hinduism — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Hinduism",
      },
      {
        label: "Hinduism — Britannica",
        href: "https://www.britannica.com/topic/Hinduism",
      },
    ],
  },
];
