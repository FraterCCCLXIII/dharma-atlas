# Books Taxonomy Proposal

A filter / tagging model for Dharma Atlas Books that separates **lineage** from **theme**, reuses the site ontology, and stays practical for a small-but-growing catalog (~47 titles today).

**Status:** proposal (not implemented)  
**Related:** [`publisher-filter-navs.md`](./publisher-filter-navs.md), ontology in `src/lib/ontology/defaults.ts`

---

## Problem with the current model

Today each book has a single flat `topic` string. That mixes three different ideas:

| Current `topic` | What it actually is | Examples |
| --- | --- | --- |
| Tibetan, Zen, Theravada, Mahayana, Hindu, Advaita | **Lineage / tradition** | Pema, Suzuki, Ajahn Chah |
| Insight | **School** (and sometimes theme) | Goldstein, Salzberg, Kornfield |
| Mindfulness, Contemplative | **Theme** (practice / audience) | Kabat-Zinn, Tolle, Singer |
| Buddhism | Vague catch-all | Thich Nhat Hanh intros |

A reader filtering “Mindfulness” should still find Pema’s *How to Meditate*; filtering “Tibetan” should still find it too. One string can’t express that.

---

## Design principles

1. **Reuse the ontology** — tradition / school IDs are the same slugs as places, people, and tradition articles (`tibetan`, `insight`, `advaita-vedanta`, …).
2. **Separate axes** — lineage ≠ theme (Wisdom’s Category vs School insight; Shambhala’s depth for schools).
3. **Multi-tag** — books get arrays, not a single bucket.
4. **Small surface first** — ship Tradition + Theme + Publisher; add School when we can tag confidently.
5. **Prefer fewer, clearer facets** over Sounds True–style wellness sprawl.

---

## Proposed axes

### 1. Tradition (primary, multi-select)

Ontology **lineage / other-tradition slugs**. Shown as checkboxes with counts (Wisdom-style).

| Slug | Label in UI | Use for |
| --- | --- | --- |
| `buddhist` | Buddhism (general) | Broad intros that aren’t lineage-specific |
| `tibetan` | Tibetan | Tibetan / Vajrayana / Shambhala-rooted |
| `zen` | Zen | Zen / Chan / Sŏn / Thiền |
| `theravada` | Theravada | Pali / early Buddhism / Thai Forest / etc. |
| `mahayana` | Mahayana | Classical Mahayana not better filed under Zen/Tibetan |
| `hindu` | Hindu | Yoga / bhakti / Gita / Yogananda, etc. |
| `advaita-vedanta` | Advaita Vedanta | Explicit Advaita |
| `non-dualism` | Nonduality | Contemporary nondual when not Advaita-specific |
| `contemplative-christian` | Contemplative Christian | When we add those titles |
| `sufi` | Sufi | When we add those titles |

**Rules**

- Prefer the **most specific tradition** that still feels honest (Suzuki → `zen`, not only `buddhist`).
- Add `buddhist` only when the book is deliberately pan-Buddhist / introductory.
- A book may have **0–2 traditions** (e.g. Thich Nhat Hanh: `zen` + `buddhist`, or just `zen` / Engaged — see Themes).
- Do **not** invent book-only tradition strings.

### 2. School (secondary, optional, gated)

Ontology **subschool slugs**. Show in the filter UI only when a parent tradition is selected (or when any school tags exist in the result set).

Priority schools for the current catalog:

| Slug | Parent | Tag when… |
| --- | --- | --- |
| `insight` | theravada | IMS / Insight Meditation Society lineage (Goldstein, Salzberg, Kornfield) |
| `vipassana` | theravada | Explicit Goenka / vipassana-method titles |
| `thai-forest` | theravada | Ajahn Chah and Thai Forest |
| `shambhala` | tibetan | Trungpa / Sakyong / Shambhala teachings |
| `kagyu` | tibetan | Explicitly Kagyu |
| `gelug` | tibetan | Explicitly Gelug / FPMT / Dalai Lama scholastic |
| `nyingma` | tibetan | Explicitly Nyingma / Dzogchen |
| `soto` | zen | Suzuki / SFZC / Soto |
| `rinzai` | zen | Explicitly Rinzai |

**Rules**

- Leave empty when unsure — wrong school tags are worse than none.
- Many popular Pema / general Tibetan titles stay `tibetan` with **no** school.

### 3. Theme (orthogonal, multi-select)

Practice / audience tags that cut across lineage. These are **books-only** — not ontology nodes.

Start small:

| ID | Label | Meaning |
| --- | --- | --- |
| `introductory` | Introductory | First-book / overview |
| `mindfulness` | Mindfulness | Secular or Buddhist mindfulness practice |
| `meditation-instruction` | Meditation instruction | How-to sit / technique manuals |
| `compassion` | Compassion & lojong | Metta, lojong, bodhicitta practice |
| `daily-life` | Daily life & emotions | Applying practice to relationships, fear, grief |
| `philosophy-texts` | Philosophy & classic texts | Sutras, shastras, Gita, translations |
| `contemporary-spirituality` | Contemporary spirituality | Cross-tradition popular (Tolle, Singer, Ram Dass) |
| `engaged` | Engaged / interfaith | Social engagement, interfaith (e.g. *Living Buddha, Living Christ*) |

**Defer for later** (when catalog grows): `death-dying`, `academic`, `poetry`, `biography`, `children`.

**Rules**

- Themes never replace tradition. *Mindfulness in Plain English* → tradition `theravada` + themes `mindfulness`, `meditation-instruction`, `introductory`.
- Prefer 1–3 themes per book.

### 4. Publisher (keep)

Unchanged. Multi-select dropdown. Featured presses first (Shambhala, Wisdom, Pariyatti). Merchandising facet, not ontology.

### 5. Later (not now)

| Facet | When |
| --- | --- |
| Author | Catalog ≫ ~100 or teacher↔book linking ships |
| Format | If we add audio / courses |
| Level (beginner / intermediate / advanced) | After themes stabilize |
| Series | Wisdom/Shambhala series pages, if we ingest them |
| New / featured | Soft merchandising flag |

---

## Suggested data shape

Replace flat `topic: string` with:

```ts
export type BookTraditionSlug =
  | "buddhist"
  | "tibetan"
  | "zen"
  | "theravada"
  | "mahayana"
  | "hindu"
  | "advaita-vedanta"
  | "non-dualism"
  | "contemplative-christian"
  | "sufi";

export type BookThemeId =
  | "introductory"
  | "mindfulness"
  | "meditation-instruction"
  | "compassion"
  | "daily-life"
  | "philosophy-texts"
  | "contemporary-spirituality"
  | "engaged";

export type AmazonBook = {
  asin: string;
  title: string;
  author: string;
  /** Ontology lineage / other-tradition slugs. */
  traditions: BookTraditionSlug[];
  /** Ontology subschool slugs; omit when unknown. */
  schools?: string[];
  /** Cross-cutting practice / audience tags. */
  themes: BookThemeId[];
  publisher: string;
  openLibraryCoverId: number;
};
```

Filter store becomes: `traditions[]`, `schools[]`, `themes[]`, `publishers[]`, `query`.

Match logic (AND across facets, OR within a facet):

- selected traditions → book has **any** of them
- selected schools → book has **any** of them
- selected themes → book has **any** of them
- selected publishers → unchanged

---

## Migration map (current `topic` → new tags)

| Current topic | Default `traditions` | Default `schools` | Default `themes` | Notes |
| --- | --- | --- | --- | --- |
| Tibetan | `tibetan` | *(per title)* | often `daily-life` / `compassion` | Tag `shambhala` for Trungpa / Sakyong / clear Shambhala titles |
| Zen | `zen` | `soto` when Suzuki-lineage | `introductory` / `meditation-instruction` as fits | |
| Theravada | `theravada` | `thai-forest` for Ajahn Chah; else none | `introductory` / `philosophy-texts` / `meditation-instruction` | |
| Insight | `theravada` | `insight` | `meditation-instruction`, sometimes `compassion` | |
| Mahayana | `mahayana` | — | `philosophy-texts` or `compassion` | Shantideva → philosophy; Pema commentary → compassion |
| Mindfulness | *(best tradition if clear)* | — | `mindfulness` (+ `meditation-instruction`) | Kabat-Zinn may be tradition-empty or `buddhist`; Pema *How to Meditate* → `tibetan` + themes |
| Contemplative | `non-dualism` when honest, else `[]` | — | `contemporary-spirituality` | Don’t force Hindu/Buddhist |
| Hindu | `hindu` | — | `philosophy-texts` or `introductory` | |
| Advaita | `advaita-vedanta` | — | `philosophy-texts` / `contemporary-spirituality` | |
| Buddhism | `buddhist` | — | `introductory` | Retag to a lineage when obvious (e.g. TNH → consider `zen`) |

### Example retags

| Book | traditions | schools | themes |
| --- | --- | --- | --- |
| Zen Mind, Beginner's Mind | `zen` | `soto` | `introductory`, `meditation-instruction` |
| When Things Fall Apart | `tibetan` | `shambhala`? *(optional)* | `daily-life`, `compassion` |
| Mindfulness in Plain English | `theravada` | — | `mindfulness`, `meditation-instruction`, `introductory` |
| A Path with Heart | `theravada` | `insight` | `daily-life`, `meditation-instruction` |
| The Power of Now | `non-dualism` | — | `contemporary-spirituality`, `introductory` |
| The Way of the Bodhisattva | `mahayana` | — | `philosophy-texts`, `compassion` |
| Living Buddha, Living Christ | `buddhist` | — | `engaged`, `introductory` |
| I Am That | `advaita-vedanta` | — | `philosophy-texts` |

---

## Filter UI (target)

```
Filters
├── Search
├── Tradition          ← checkbox list + counts (like Wisdom Category)
├── School             ← checkbox list; visible when relevant / any selected tradition has schools
├── Theme              ← checkbox list + counts
└── Publisher          ← multi-select dropdown (current)
```

Order mirrors how practitioners browse: **where in the Dharma?** → **which stream?** → **what kind of book?** → **which press?**

---

## Why this over alternatives

| Alternative | Why not |
| --- | --- |
| Keep one `topic` field, expand the list | Still can’t express Tibetan + Mindfulness |
| Themes only (Sounds True style) | Loses lineage, weak link to Traditions pages / explore |
| Full Shambhala-depth school tree in UI now | Too sparse for 47 books; empty checkboxes |
| Publisher-as-primary | Good merchandising, bad spiritual findability |

---

## Implementation sketch (when we build it)

1. Add types + constants for traditions / themes in `src/data/` or `src/lib/books/`.
2. Retag `AMAZON_BOOKS` (one PR; mechanical migration table above).
3. Update `books-store` + `BooksFilterBar` + `BooksPageView`.
4. Derive filter options from tagged data (hide empty schools/themes).
5. Optional later: link tradition article “Texts” to catalog ASINs; link teacher bibliography entries.

---

## Open questions

1. Should Pema / Trungpa default school be `shambhala`, or leave school empty for popular titles?
2. Is `buddhist` shown as its own filter chip, or only used as a tag for pan-Buddhist intros?
3. For Kabat-Zinn / Tara Brach, prefer tradition `[]` + theme `mindfulness`, or soft-tag `buddhist` / `theravada`?
4. Do we want tradition article pages to auto-list catalog books by slug match?
