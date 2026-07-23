import type { TraditionArticle } from "../types";

export const buddhistArticle: TraditionArticle = {
  slug: "buddhist",
  heroImage: "/traditions/buddhist.jpg",
  heroImageCredit: {
    name: "Pexels",
    url: "https://www.pexels.com/license/",
  },
  summary:
    "A family of traditions arising from the teachings of the Buddha, spanning meditation, ethics, and insight across Asia and the modern world.",
  body: `Buddhism began in northern India in the fifth or fourth century BCE with the awakening of Siddhartha Gautama — the Buddha — and the community that formed around his teaching. At its heart is a diagnosis of human suffering (*dukkha*) and a path of ethical conduct, mental training, and wisdom that leads toward liberation.

Over centuries the Dharma traveled along trade routes into Central, East, and Southeast Asia. Distinct canons, languages, and institutional forms emerged: the Pali Tipitaka of Theravāda; the vast Mahāyāna sūtra collections of East Asia; and the tantric and scholastic systems of Tibet and the Himalayas. What unites these streams is less a single creed than a shared concern with awakening, compassion, and the end of clinging.

In the modern era, Buddhist practice has taken root far beyond Asia — in meditation centers, temples, universities, and living rooms. Lineages that once were geographically distant now sit side by side. Dharma Atlas maps those communities so practitioners can find teachers, sanghas, and places of practice connected to the traditions below.

## Major streams

- **Theravāda** — the “Teaching of the Elders,” prominent in Sri Lanka and mainland Southeast Asia, with a strong emphasis on the Pali Canon and monastic vinaya.
- **Mahāyāna** — the “Great Vehicle,” encompassing Zen, Pure Land, and many East Asian schools that emphasize the bodhisattva ideal.
- **Vajrayāna / Tibetan** — esoteric and scholastic lineages of Tibet, Bhutan, Mongolia, and the Himalayan borderlands.

Each lineage and school on this site has its own page with practices, texts, teachers, and places.`,
  practices: [
    {
      title: "Ethical precepts",
      description:
        "Training in non-harming, honesty, and restraint — traditionally five precepts for laypeople and fuller vinaya for monastics.",
    },
    {
      title: "Meditation (samādhi)",
      description:
        "Calm abiding and insight practices that stabilize attention and investigate the nature of experience.",
    },
    {
      title: "Wisdom (prajñā)",
      description:
        "Study and contemplation of dependent arising, not-self, and emptiness as paths to liberation.",
    },
    {
      title: "Sangha life",
      description:
        "Practicing with a community — temples, centers, and retreats that sustain daily discipline.",
    },
  ],
  texts: [
    {
      title: "The Heart of the Buddha's Teaching",
      author: "Thich Nhat Hanh",
      note: "Accessible overview of core doctrines and practices.",
      href: "https://www.amazon.com/dp/0767903692",
    },
    {
      title: "What the Buddha Taught",
      author: "Walpola Rahula",
      note: "Classic introduction grounded in the Pali sources.",
    },
    {
      title: "In the Buddha's Words",
      author: "Bhikkhu Bodhi (ed.)",
      note: "Anthology of discourses from the Pali Canon.",
    },
  ],
  sources: [
    {
      label: "Buddhism — Wikipedia",
      href: "https://en.wikipedia.org/wiki/Buddhism",
    },
    {
      label: "Buddha — Stanford Encyclopedia of Philosophy",
      href: "https://plato.stanford.edu/entries/buddha/",
    },
    {
      label: "Access to Insight",
      href: "https://www.accesstoinsight.org/",
    },
  ],
};
