export type AmazonBook = {
  asin: string;
  title: string;
  author: string;
  /** Short tradition / topic label for grouping. */
  topic: string;
  publisher: string;
  /** Open Library cover id — used for accurate cover art. */
  openLibraryCoverId: number;
};

/**
 * Curated dharma-related titles with Amazon ASINs + Open Library covers.
 * Grown from core classics plus Shambhala / Wisdom / related presses.
 */
export const AMAZON_BOOKS: AmazonBook[] = [
  {
    asin: "0767903692",
    title: "The Heart of the Buddha's Teaching",
    author: "Thich Nhat Hanh",
    topic: "Buddhism",
    publisher: "Broadway Books",
    openLibraryCoverId: 527670,
  },
  {
    asin: "1590308492",
    title: "Zen Mind, Beginner's Mind",
    author: "Shunryu Suzuki",
    topic: "Zen",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 7025011,
  },
  {
    asin: "0807012394",
    title: "The Miracle of Mindfulness",
    author: "Thich Nhat Hanh",
    topic: "Mindfulness",
    publisher: "Beacon Press",
    openLibraryCoverId: 8262944,
  },
  {
    asin: "1611803438",
    title: "When Things Fall Apart",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 12661533,
  },
  {
    asin: "0553380990",
    title: "Radical Acceptance",
    author: "Tara Brach",
    topic: "Mindfulness",
    publisher: "Bantam",
    // Bantam edition cover (work default 7020283 is a wrong strip image)
    openLibraryCoverId: 7892523,
  },
  {
    asin: "0553372114",
    title: "A Path with Heart",
    author: "Jack Kornfield",
    topic: "Insight",
    publisher: "Bantam",
    openLibraryCoverId: 369559,
  },
  {
    asin: "159030280X",
    title: "Lovingkindness",
    author: "Sharon Salzberg",
    topic: "Insight",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 817037,
  },
  {
    asin: "0861719069",
    title: "Mindfulness in Plain English",
    author: "Bhante Gunaratana",
    topic: "Theravada",
    publisher: "Wisdom Publications",
    openLibraryCoverId: 652683,
  },
  {
    asin: "1570629579",
    title: "Cutting Through Spiritual Materialism",
    author: "Chögyam Trungpa",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 671217,
  },
  {
    asin: "1590300572",
    title: "The Way of the Bodhisattva",
    author: "Shantideva",
    topic: "Mahayana",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 13239343,
  },
  {
    asin: "0802130313",
    title: "What the Buddha Taught",
    author: "Walpola Rahula",
    topic: "Theravada",
    publisher: "Grove Press",
    openLibraryCoverId: 568525,
  },
  {
    asin: "0385260938",
    title: "The Three Pillars of Zen",
    author: "Philip Kapleau",
    topic: "Zen",
    publisher: "Anchor",
    openLibraryCoverId: 238807,
  },
  {
    asin: "1401307787",
    title: "Wherever You Go, There You Are",
    author: "Jon Kabat-Zinn",
    topic: "Mindfulness",
    publisher: "Hyperion",
    openLibraryCoverId: 749813,
  },
  {
    asin: "1577314808",
    title: "The Power of Now",
    author: "Eckhart Tolle",
    topic: "Contemplative",
    publisher: "New World Library",
    openLibraryCoverId: 551262,
  },
  {
    asin: "0517543052",
    title: "Be Here Now",
    author: "Ram Dass",
    topic: "Contemplative",
    publisher: "Crown",
    openLibraryCoverId: 12441918,
  },
  {
    asin: "0876120796",
    title: "Autobiography of a Yogi",
    author: "Paramahansa Yogananda",
    topic: "Hindu",
    publisher: "Self-Realization Fellowship",
    openLibraryCoverId: 805448,
  },
  {
    asin: "1586380192",
    title: "The Bhagavad Gita",
    author: "Eknath Easwaran",
    topic: "Hindu",
    publisher: "Nilgiri Press",
    openLibraryCoverId: 1955084,
  },
  {
    asin: "0893860220",
    title: "I Am That",
    author: "Sri Nisargadatta Maharaj",
    topic: "Advaita",
    publisher: "Acorn Press",
    openLibraryCoverId: 692689,
  },
  {
    asin: "1572245379",
    title: "The Untethered Soul",
    author: "Michael A. Singer",
    topic: "Contemplative",
    publisher: "New Harbinger",
    openLibraryCoverId: 10630553,
  },
  {
    asin: "159030991X",
    title: "The Wisdom of No Escape",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 6298837,
  },
  {
    asin: "1590308352",
    title: "Start Where You Are",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 817588,
  },
  {
    asin: "0062511408",
    title: "Living Buddha, Living Christ",
    author: "Thich Nhat Hanh",
    topic: "Buddhism",
    publisher: "Riverhead",
    openLibraryCoverId: 450758,
  },
  {
    asin: "0861713338",
    title: "The Heart of Awareness",
    author: "Thomas Byrom",
    topic: "Advaita",
    publisher: "Wisdom Publications",
    openLibraryCoverId: 4095095,
  },
  // —— Shambhala Publications ——
  {
    asin: "1590304519",
    title: "Shambhala: The Sacred Path of the Warrior",
    author: "Chögyam Trungpa",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 859759,
  },
  {
    asin: "1611804205",
    title: "The Places That Scare You",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 14453143,
  },
  {
    asin: "1590300785",
    title: "Comfortable with Uncertainty",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 859507,
  },
  {
    asin: "1611800412",
    title: "How to Meditate",
    author: "Pema Chödrön",
    topic: "Mindfulness",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 7787205,
  },
  {
    asin: "1590300513",
    title: "Training the Mind",
    author: "Chögyam Trungpa",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 859483,
  },
  {
    asin: "1570629331",
    title: "The Myth of Freedom",
    author: "Chögyam Trungpa",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 817653,
  },
  {
    asin: "157062805X",
    title: "Seeking the Heart of Wisdom",
    author: "Joseph Goldstein & Jack Kornfield",
    topic: "Insight",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 817563,
  },
  {
    asin: "1590300165",
    title: "Insight Meditation",
    author: "Joseph Goldstein",
    topic: "Insight",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 859453,
  },
  {
    asin: "1590301366",
    title: "Breath by Breath",
    author: "Larry Rosenberg",
    topic: "Insight",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 859542,
  },
  {
    asin: "1570628084",
    title: "Being Dharma",
    author: "Ajahn Chah",
    topic: "Theravada",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 817566,
  },
  {
    asin: "1590307666",
    title: "The Heart of the Buddha",
    author: "Chögyam Trungpa",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 7736557,
  },
  {
    asin: "1590304241",
    title: "No Time to Lose",
    author: "Pema Chödrön",
    topic: "Mahayana",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 859743,
  },
  {
    asin: "1590308433",
    title: "Taking the Leap",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 6297229,
  },
  {
    asin: "1611800765",
    title: "Living Beautifully",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 12864336,
  },
  {
    asin: "1611805651",
    title: "Welcoming the Unwelcome",
    author: "Pema Chödrön",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 10203284,
  },
  {
    asin: "1590305272",
    title: "A Heart Full of Peace",
    author: "Joseph Goldstein",
    topic: "Insight",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 859798,
  },
  {
    asin: "1590302362",
    title: "The Experience of Insight",
    author: "Joseph Goldstein",
    topic: "Insight",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 12857950,
  },
  {
    asin: "159030876X",
    title: "Meditation in Action",
    author: "Chögyam Trungpa",
    topic: "Tibetan",
    publisher: "Shambhala Publications",
    openLibraryCoverId: 4037544,
  },
  // —— Wisdom Publications ——
  {
    asin: "0861714911",
    title: "In the Buddha's Words",
    author: "Bhikkhu Bodhi",
    topic: "Theravada",
    publisher: "Wisdom Publications",
    openLibraryCoverId: 652754,
  },
  {
    asin: "0861713230",
    title: "Food for the Heart",
    author: "Ajahn Chah",
    topic: "Theravada",
    publisher: "Wisdom Publications",
    openLibraryCoverId: 652686,
  },
  {
    asin: "0861710975",
    title: "The World of Tibetan Buddhism",
    author: "Dalai Lama",
    topic: "Tibetan",
    publisher: "Wisdom Publications",
    openLibraryCoverId: 1607967,
  },
  // —— Other presses ——
  {
    asin: "192870607X",
    title: "The Noble Eightfold Path",
    author: "Bhikkhu Bodhi",
    topic: "Theravada",
    publisher: "Pariyatti",
    openLibraryCoverId: 952846,
  },
  {
    asin: "0307347311",
    title: "The Joy of Living",
    author: "Yongey Mingyur Rinpoche",
    topic: "Tibetan",
    publisher: "Harmony",
    openLibraryCoverId: 12511568,
  },
  {
    asin: "157322345X",
    title: "Turning the Mind Into an Ally",
    author: "Sakyong Mipham",
    topic: "Tibetan",
    publisher: "Riverhead",
    openLibraryCoverId: 824177,
  },
];

export const BOOK_TOPICS = Array.from(
  new Set(AMAZON_BOOKS.map((book) => book.topic)),
).sort();

/** Featured presses first — the catalogs we’re growing from. */
const FEATURED_PUBLISHERS = [
  "Shambhala Publications",
  "Wisdom Publications",
  "Pariyatti",
] as const;

export const BOOK_PUBLISHERS = (() => {
  const all = Array.from(new Set(AMAZON_BOOKS.map((book) => book.publisher)));
  const featured = FEATURED_PUBLISHERS.filter((publisher) =>
    all.includes(publisher),
  );
  const rest = all
    .filter(
      (publisher) =>
        !(FEATURED_PUBLISHERS as readonly string[]).includes(publisher),
    )
    .sort();
  return [...featured, ...rest];
})();
