import type { TraditionArticle } from "../types";

const hero = "/traditions/theravada.jpg";
const credit = {
  name: "Pexels",
  url: "https://www.pexels.com/license/",
};

export const theravadaArticles: TraditionArticle[] = [
  {
    slug: "theravada",
    heroImage: hero,
    heroImageCredit: credit,
    summary:
      "The “Teaching of the Elders” — grounded in the Pali Canon and living monastic traditions of South and Southeast Asia.",
    body: `Theravāda Buddhism preserves the Pali Tipitaka and a continuous monastic vinaya tradition. It is the dominant form of Buddhism in Sri Lanka, Myanmar, Thailand, Laos, and Cambodia, and has deep roots in modern insight (vipassanā) movements.

Doctrinally, Theravāda emphasizes the Four Noble Truths, dependent arising, and the path of *sīla*, *samādhi*, and *paññā*. Laypeople support the Sangha through dana, keep precepts, and practice meditation; monastics uphold the full vinaya. Twentieth-century teachers such as Mahasi Sayadaw, Ajahn Chah, and the Insight Meditation Society founders brought Theravāda methods to a global audience.

Related pages cover Vipassana, Insight Meditation, and Thai Forest lineages.`,
    practices: [
      {
        title: "Vipassanā (insight)",
        description:
          "Noting or observing bodily and mental phenomena to see impermanence, unsatisfactoriness, and not-self.",
      },
      {
        title: "Samatha (calm)",
        description:
          "Concentration practices such as ānāpānasati (mindfulness of breathing) and jhāna training.",
      },
      {
        title: "Precepts & dana",
        description:
          "Ethical restraint and generosity as the foundation of lay and monastic life.",
      },
      {
        title: "Pali chanting",
        description:
          "Recitation of protective and doctrinal verses in temples and homes.",
      },
    ],
    texts: [
      {
        title: "In the Buddha's Words",
        author: "Bhikkhu Bodhi (ed.)",
      },
      {
        title: "The Heart of the Buddha's Teaching",
        author: "Thich Nhat Hanh",
        href: "https://www.amazon.com/dp/0767903692",
      },
      {
        title: "Visuddhimagga (The Path of Purification)",
        author: "Buddhaghosa",
      },
    ],
    sources: [
      {
        label: "Theravada — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Theravada",
      },
      {
        label: "Access to Insight",
        href: "https://www.accesstoinsight.org/",
      },
    ],
  },
  {
    slug: "vipassana",
    heroImage: "/traditions/vipassana.jpg",
    heroImageCredit: credit,
    summary:
      "Insight meditation traditions — especially the Goenka and Mahasi streams — teaching systematic observation of body and mind.",
    body: `Vipassanā means “clear seeing.” In popular usage it often refers to intensive insight courses in the tradition of S. N. Goenka (from U Ba Khin) or noting techniques from Mahasi Sayadaw. Both aim at direct knowledge of impermanence through disciplined attention.

Goenka-style centers offer standardized ten-day silent retreats worldwide under the Dhamma.org network. Other vipassanā monasteries and societies teach related methods with different pacing and doctrine. The emphasis is experiential: sit, observe, and understand.`,
    practices: [
      {
        title: "Body-scan / vedanā awareness",
        description:
          "Systematic attention to sensations as taught in the Goenka tradition.",
      },
      {
        title: "Mental noting",
        description:
          "Labeling arising phenomena (Mahasi-style) to sharpen mindfulness.",
      },
      {
        title: "Noble silence retreats",
        description:
          "Multi-day courses with restricted speech and a fixed daily schedule.",
      },
    ],
    texts: [
      {
        title: "The Art of Living",
        author: "William Hart / S. N. Goenka",
      },
      {
        title: "Practical Insight Meditation",
        author: "Mahasi Sayadaw",
      },
    ],
    sources: [
      {
        label: "Vipassanā — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Vipassan%C4%81",
      },
    ],
  },
  {
    slug: "insight",
    heroImage: "/traditions/insight.jpg",
    heroImageCredit: credit,
    summary:
      "Western Insight Meditation communities rooted in Theravāda, emphasizing mindfulness and accessibility for laypeople.",
    body: `Insight Meditation in the West grew from teachers who trained in Asia — including Joseph Goldstein, Sharon Salzberg, Jack Kornfield, and others — and founded centers such as IMS and Spirit Rock. The style draws on Burmese and Thai methods while adapting language and retreat formats for contemporary lay practitioners.

Programs often include mindfulness of breath and body, mettā (loving-kindness), and Dharma talks connecting classical teachings to psychological insight. Many urban “insight” sanghas offer weekly sits without requiring monastic affiliation.`,
    practices: [
      {
        title: "Mindfulness retreats",
        description:
          "Silent residential retreats with sitting, walking, and interviews.",
      },
      {
        title: "Mettā practice",
        description:
          "Cultivation of loving-kindness toward self and others.",
      },
      {
        title: "Dharma study groups",
        description:
          "Weekly community sits and discussion for householders.",
      },
    ],
    texts: [
      {
        title: "Mindfulness in Plain English",
        author: "Bhante Gunaratana",
      },
      {
        title: "Radical Acceptance",
        author: "Tara Brach",
        href: "https://www.amazon.com/dp/0553380990",
      },
    ],
    sources: [
      {
        label: "Insight Meditation Society",
        href: "https://www.dharma.org/",
      },
    ],
  },
  {
    slug: "thai-forest",
    heroImage: "/traditions/thai-forest.jpg",
    heroImageCredit: credit,
    summary:
      "The Thai Forest Tradition — austere monastic practice in wilderness monasteries, influential worldwide through Ajahn Chah’s disciples.",
    body: `The Thai Forest Tradition revitalized meditation-focused monasticism in Thailand’s forests, associated with Ajahn Mun and later Ajahn Chah, Ajahn Maha Bua, and others. Practitioners emphasize vinaya strictness, simplicity, and direct meditation over scholasticism alone.

Western branch monasteries — Amaravati, Abhayagiri, Wat Metta, and many more — offer guest stays, retreats, and a clear monastic container. Lay supporters often practice ānāpānasati and keep close connections to forest ajahns.`,
    practices: [
      {
        title: "Ānāpānasati",
        description:
          "Mindfulness of breathing as a primary meditation object.",
      },
      {
        title: "Tudong & renunciation",
        description:
          "Ascetic forest practices and wandering mendicancy in traditional settings.",
      },
      {
        title: "Community work & Vinaya",
        description:
          "Shared labor and meticulous ethical discipline as the training ground.",
      },
    ],
    texts: [
      {
        title: "Food for the Heart",
        author: "Ajahn Chah",
      },
      {
        title: "The Island",
        author: "Ajahn Passano & Ajahn Amaro (ed.)",
        note: "Anthology of forest tradition teachings.",
      },
    ],
    sources: [
      {
        label: "Thai Forest Tradition — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Thai_Forest_Tradition",
      },
    ],
  },
];
