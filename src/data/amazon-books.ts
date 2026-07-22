export type AmazonBook = {
  asin: string;
  title: string;
  author: string;
  /** Short tradition / topic label for grouping. */
  topic: string;
  /** Open Library cover id — used for accurate cover art. */
  openLibraryCoverId: number;
};

/**
 * Curated dharma-related titles with Amazon ASINs + Open Library covers.
 */
export const AMAZON_BOOKS: AmazonBook[] = [
  {
    asin: "0767903692",
    title: "The Heart of the Buddha's Teaching",
    author: "Thich Nhat Hanh",
    topic: "Buddhism",
    openLibraryCoverId: 527670,
  },
  {
    asin: "1590308492",
    title: "Zen Mind, Beginner's Mind",
    author: "Shunryu Suzuki",
    topic: "Zen",
    openLibraryCoverId: 7025011,
  },
  {
    asin: "0807012394",
    title: "The Miracle of Mindfulness",
    author: "Thich Nhat Hanh",
    topic: "Mindfulness",
    openLibraryCoverId: 8262944,
  },
  {
    asin: "1611803438",
    title: "When Things Fall Apart",
    author: "Pema Chödrön",
    topic: "Tibetan",
    openLibraryCoverId: 12661533,
  },
  {
    asin: "0553380990",
    title: "Radical Acceptance",
    author: "Tara Brach",
    topic: "Mindfulness",
    // Bantam edition cover (work default 7020283 is a wrong strip image)
    openLibraryCoverId: 7892523,
  },
  {
    asin: "0553372114",
    title: "A Path with Heart",
    author: "Jack Kornfield",
    topic: "Insight",
    openLibraryCoverId: 369559,
  },
  {
    asin: "159030280X",
    title: "Lovingkindness",
    author: "Sharon Salzberg",
    topic: "Insight",
    openLibraryCoverId: 817037,
  },
  {
    asin: "0861719069",
    title: "Mindfulness in Plain English",
    author: "Bhante Gunaratana",
    topic: "Theravada",
    openLibraryCoverId: 652683,
  },
  {
    asin: "1570629579",
    title: "Cutting Through Spiritual Materialism",
    author: "Chögyam Trungpa",
    topic: "Tibetan",
    openLibraryCoverId: 671217,
  },
  {
    asin: "1590300572",
    title: "The Way of the Bodhisattva",
    author: "Shantideva",
    topic: "Mahayana",
    openLibraryCoverId: 13239343,
  },
  {
    asin: "0802130313",
    title: "What the Buddha Taught",
    author: "Walpola Rahula",
    topic: "Theravada",
    openLibraryCoverId: 568525,
  },
  {
    asin: "0385260938",
    title: "The Three Pillars of Zen",
    author: "Philip Kapleau",
    topic: "Zen",
    openLibraryCoverId: 238807,
  },
  {
    asin: "1401307787",
    title: "Wherever You Go, There You Are",
    author: "Jon Kabat-Zinn",
    topic: "Mindfulness",
    openLibraryCoverId: 749813,
  },
  {
    asin: "1577314808",
    title: "The Power of Now",
    author: "Eckhart Tolle",
    topic: "Contemplative",
    openLibraryCoverId: 551262,
  },
  {
    asin: "0517543052",
    title: "Be Here Now",
    author: "Ram Dass",
    topic: "Contemplative",
    openLibraryCoverId: 12441918,
  },
  {
    asin: "0876120796",
    title: "Autobiography of a Yogi",
    author: "Paramahansa Yogananda",
    topic: "Hindu",
    openLibraryCoverId: 805448,
  },
  {
    asin: "1586380192",
    title: "The Bhagavad Gita",
    author: "Eknath Easwaran",
    topic: "Hindu",
    openLibraryCoverId: 1955084,
  },
  {
    asin: "0893860220",
    title: "I Am That",
    author: "Sri Nisargadatta Maharaj",
    topic: "Advaita",
    openLibraryCoverId: 692689,
  },
  {
    asin: "1572245379",
    title: "The Untethered Soul",
    author: "Michael A. Singer",
    topic: "Contemplative",
    openLibraryCoverId: 10630553,
  },
  {
    asin: "159030991X",
    title: "The Wisdom of No Escape",
    author: "Pema Chödrön",
    topic: "Tibetan",
    openLibraryCoverId: 6298837,
  },
  {
    asin: "1590308352",
    title: "Start Where You Are",
    author: "Pema Chödrön",
    topic: "Tibetan",
    openLibraryCoverId: 817588,
  },
  {
    asin: "0062511408",
    title: "Living Buddha, Living Christ",
    author: "Thich Nhat Hanh",
    topic: "Buddhism",
    openLibraryCoverId: 450758,
  },
  {
    asin: "0861713338",
    title: "The Heart of Awareness",
    author: "Thomas Byrom",
    topic: "Advaita",
    openLibraryCoverId: 4095095,
  },
];

export const BOOK_TOPICS = [
  "All",
  ...Array.from(new Set(AMAZON_BOOKS.map((book) => book.topic))).sort(),
] as const;
