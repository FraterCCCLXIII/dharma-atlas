# Contemplative Ontology

Canonical design for Dharma Atlas tradition / lineage / school taxonomy — places, people, tradition articles, explore filters, and (via shared slugs) books.

**Status:** design (implementation pending — seed today is still `src/lib/ontology/defaults.ts`)  
**Related:** [`books-taxonomy.md`](./books-taxonomy.md), [`publisher-filter-navs.md`](./publisher-filter-navs.md)  
**Last updated:** 2026-07-24

---

## Current state (problems)

Source of truth today: nested ontology in `src/lib/ontology/defaults.ts`, persisted in `ontology_nodes`.

| Issue | Detail |
| --- | --- |
| Buddhist-shaped tree | Buddhism has lineage → subschool depth; every other tradition is a flat root chip |
| Advaita misplaced | `advaita-vedanta` is a peer of `hindu`, not nested under it |
| Faith binary | `Faith = "Buddhist" \| "Hindu"` forces Sufi / Christian / etc. into Hindu for place lineage |
| Empty Hindu | No Vedānta, Śaivism, Yoga, Bhakti, Kashmir Shaivism |
| Missing families | No Judaism, Jainism, Sikhism, Daoism |
| Soka Gakkai | Nested under Pure Land; belongs under Nichiren |
| Theravāda vs Southeast Asian | Parallel overlapping branches |
| Nonduality as religion root | Modern cross-traditional category treated as a civilizational peer |
| General retreat hosts | No honest home for multi-tradition / host venues |

---

## Design principles

1. **Roots are civilizational / self-ID families** — Buddhism, Hinduism, Jainism, Judaism, etc. Modern practice buckets are not religions.
2. **Nest doctrine under family** — Advaita → Hinduism → Vedānta. Kashmir Shaivism → Hinduism → Śaivism. SGI → Buddhism → Nichiren.
3. **Affiliation = ontology root slug** — replace `Faith = Buddhist \| Hindu` with the root (or an expanded enum aligned to roots).
4. **Multi-label** — places/people/books may carry 1–2 lineage tags when hybrid.
5. **Two axes** — lineage ontology ≠ practice themes (mindfulness, engaged, pilgrimage). Themes stay orthogonal (see books taxonomy / CMind Tree).
6. **Ship depth where density exists** — don’t invent dozens of leaves with zero places; grow schools when centers/teachers exist.
7. **Prefer community self-description** over forced comparative-religion purity.
8. **Filter UX thinner than ontology** — full tree in data; explore UI collapses to top traditions by place count + “More.”

---

## Naming decisions

| Concept | Term | Avoid |
| --- | --- | --- |
| Jewish family root | **Judaism** | “Jewish Contemplative,” “Contemplative Judaism” as root label |
| Scoped Jewish copy | “Jewish spirituality” / contemplative streams in article body | Inventing a denomination name |
| General / host venues | **Multi-tradition** (under Contemporary) | Interfaith (too narrow), Non-sectarian, Various Offerings, General, Eclectic |
| Islamic mysticism root | **Sufism** | Forcing under a full Islam tree on day one |
| Christian scoped root | **Contemplative Christianity** | Listing every parish as in-scope |
| Modern nondual | **Nonduality** under Contemporary | Peer root next to Hinduism |
| Secular mindfulness | **Mindfulness / MBSR** under Contemporary | Filing MBSR as Theravāda by default |

**Filter shortcuts:** nest Advaita and Kashmir Shaivism under Hinduism, but pin both in filter chrome so seekers can reach them in one click (Metawise pattern).

---

## Place model (target)

| Field | Role |
| --- | --- |
| `traditionRootSlug` | Ontology root (`buddhist`, `hindu`, `jain`, `judaism`, …) — replaces faith binary |
| `lineageSlug` / `schoolSlugs[]` | Nested IDs under that root |
| `themeSlugs[]` (optional) | Cross-cutting: mindfulness, engaged, pilgrimage — books axis first |
| Place **type** | Venue morphology: Center, Temple, Monastery, Meditation Center, … — consider adding **Retreat Center** |
| Offerings | e.g. `retreats` — how the place operates |
| Optional `affiliationMode` | `single` \| `multi` \| `host` — for Multi-tradition hosts that also have a resident lineage |

**General retreat centers**

| Kind | Tradition | Type / offerings |
| --- | --- | --- |
| Lineage retreat (IMS, Tassajara) | Real lineage | Monastery / Center + `retreats` |
| Secular mindfulness only | Contemporary → Mindfulness / MBSR | Center / Retreat Center |
| Multi-program / rental / lineage-agnostic host | Contemporary → **Multi-tradition** | Retreat Center + `retreats`; optional secondary lineage tags |

---

## Proposed tree

Pills in rollout: **P0** structure, **P1** missing families, **P2** deepen.

### Buddhism (`buddhist`)

```
Buddhism
├── Tibetan / Himalayan
│   ├── Nyingma
│   ├── Kagyu
│   ├── Gelug
│   ├── Sakya
│   ├── Jonang                          ← P2 add
│   ├── Shambhala                       (modern org)
│   └── Diamond Way                     (modern org)
├── Bon                                 ← P0 elevate from Tibetan subschool
│   └── Yungdrung Bon
├── Zen / Chan / Sŏn / Thiền
│   ├── Sōtō
│   ├── Rinzai
│   ├── Ōbaku
│   ├── Chan
│   ├── Sŏn (Korean)
│   ├── Thiền (Vietnamese)
│   ├── Sanbō Zen
│   └── Dharma Drum
├── Theravāda                           ← P0 absorb SEA ethnic tags here
│   ├── Thai Forest
│   ├── Vipassanā
│   ├── Insight Meditation
│   ├── Thai                            (cultural / temple)
│   ├── Burmese
│   ├── Sri Lankan
│   ├── Lao
│   └── Cambodian
├── Pure Land
│   ├── Jōdo Shin
│   ├── Jōdo Shū
│   └── Chinese Pure Land               ← P2
├── Nichiren                            ← P0 new (move Soka Gakkai here)
│   ├── Soka Gakkai
│   ├── Nichiren Shū
│   └── Nichiren Shōshū
├── Won Buddhism
└── Mahāyāna (general)                  (Fo Guang, DRBA, etc. when not Zen/Pure Land)
```

### Hinduism (`hindu`)

```
Hinduism
├── Vedānta
│   ├── Advaita Vedānta                 ← P0 nest (was peer root)
│   ├── Viśiṣṭādvaita                   ← P2
│   ├── Dvaita                          ← P2
│   └── Neo-Vedānta / Modern Vedānta    ← P2
├── Śaivism
│   ├── Kashmir Shaivism / Trika        ← P1 priority
│   ├── Śaiva Siddhānta                 ← P2
│   └── Nāth / Haṭha lineages           ← P2
├── Śāktism                             ← P2
│   ├── Śrī Vidyā
│   └── Goddess / Devī traditions
├── Vaiṣṇavism / Bhakti                 ← P2
│   ├── Gauḍīya / ISKCON
│   └── Other Vaiṣṇava / Bhakti
├── Yoga traditions                     ← P1–P2
│   ├── Classical / Pātañjala
│   ├── Kriyā Yoga / SRF
│   ├── Kuṇḍalinī Yoga
│   └── Integral Yoga
└── Tantric Hindu streams               (optional; prefer specific Śaiva/Śākta)
```

### Jainism (`jain`) — P1

```
Jainism
├── Digambara
├── Śvetāmbara
└── Contemporary Jain practice
```

### Sikhism (`sikh`) — P1–P2

```
Sikhism
├── Gurdwara / Khalsa practice
└── Nām Simran / contemplative Sikh
```

### Judaism (`judaism`) — P1

Root label: **Judaism** (not “Jewish Contemplative”). Article copy may say Jewish spirituality / contemplative streams.

```
Judaism
├── Kabbalah
├── Hasidism
├── Jewish meditation                   (incl. contemporary Jewish mindfulness)
└── Mussar
```

Optional later: Jewish Renewal as a leaf when places warrant.

### Contemplative Christianity (`contemplative-christian`)

```
Contemplative Christianity
├── Centering Prayer / Contemplative Outreach   ← P2
├── Hesychasm / Eastern Orthodox                ← P2
├── Carmelite / Catholic mystical               ← P2
├── Quaker / Friends                            ← P2
└── Christian meditation (John Main / WCCM)     ← P2
```

### Sufism (`sufi`)

```
Sufism                                  (Islamic mysticism; product root)
├── Mevlevi                             ← P2
├── Naqshbandī                          ← P2
├── Chishtī                             ← P2
├── Rifāʿī                              ← P2
└── Universal / Western Sufism          ← P2 (label carefully)
```

### Daoism (`daoist`) — P1

```
Daoism
├── Quánzhēn
├── Zhèngyī
└── Contemporary Daoist practice
```

### Contemporary (`contemporary`) — P0 structure

Not a religion. Modern / cross-traditional practice bucket.

```
Contemporary
├── Nonduality                          ← P0 demote from peer-of-Hindu root
├── Mindfulness / MBSR
├── Multi-tradition                     ← general / host / lineage-agnostic centers
└── Interfaith contemplative            ← explicit bridging programs (optional leaf)
```

**Multi-tradition vs Interfaith:** default host venues → Multi-tradition. Use Interfaith only when the community frames itself as bridging religions.

---

## Rollout priority

### P0 — structure (fix the tree shape)

- Nest Advaita under Hinduism → Vedānta
- Replace Faith binary with root affiliation
- Move Soka Gakkai → Nichiren
- Merge Southeast Asian under Theravāda (ethnic leaves)
- Elevate Bon (sibling under Buddhism; allow Tibetan multi-tag)
- Demote Nonduality under Contemporary
- Add Contemporary → Multi-tradition
- Pin Advaita (+ later Kashmir Shaivism) as filter shortcuts

### P1 — missing families

- Judaism (+ Kabbalah, Hasidism, Jewish meditation, Mussar)
- Jainism
- Kashmir Shaivism under Śaivism
- Daoism
- Sikhism (if place density supports)

### P2 — deepen existing

- Hindu: Yoga, Bhakti/ISKCON, Śāktism, other Vedānta
- Christian contemplative leaves
- Sufi ṭarīqas
- Jonang, Chinese Pure Land, Shingon if needed
- Mindfulness / MBSR leaf under Contemporary

### Defer

- Confucianism / Shinto
- Western Esoteric / Hermetic / Gnostic
- Indigenous catch-all without community partners
- Full Hindu sect encyclopedia on day one

---

## External benchmarks (summary)

Reviewed 2026-07 against peer systems:

| Source | Pattern we steal |
| --- | --- |
| Metawise | Broad multi-tradition chips; Advaita & Kashmir Shaivism first-class for discovery |
| BuddhaNet | Coarse buckets + Non-sectarian/Mixed; multi-label detail |
| Lion's Roar Directory | Nichiren ≠ Pure Land; Secular Mindfulness as peer category |
| OMP | Multi-tag good; flat soup bad — keep hierarchy |
| ZenDawn | Chooser stays ~6–7 buckets — collapse UI by count |
| Wisdom / Shambhala | Tradition × School facets; themes separate |
| Library of Congress | Separate roots for Judaism, Jainism, Islam, Buddhism, Hinduism |
| Pew | Jewish as major family; Jain/Sikh/Daoist distinct even if “other” demographically |
| CMind Tree | Practice-type axis orthogonal to lineage |

---

## Implementation notes

| Area | Path |
| --- | --- |
| Seed / defaults | `src/lib/ontology/defaults.ts` |
| Types | `src/types/ontology.ts`, `src/types/place.ts` (`Faith` → root) |
| Runtime | `src/lib/data/ontology.ts`, `src/lib/schools.ts` |
| Admin editor | `src/components/admin/OntologyEditor.tsx` |
| Explore filters | `FilterBar.tsx`, `explore-store.ts` |
| Place lineage UI | `PlaceLineageField.tsx` |
| Tradition articles | `src/content/traditions/` — add/move articles with slug changes |
| Migrations | Ontology seed sync + place faith/tradition remapping |

**Slug migration sketch**

| From | To |
| --- | --- |
| `advaita-vedanta` (root) | child of `hindu` → `vedanta` (or keep slug, change `parentSlug`) |
| `non-dualism` (root) | child of `contemporary` |
| `soka-gakkai` parent `pure-land` | parent `nichiren` |
| SEA lineage `southeast-asian` | fold under `theravada` |
| `bon` parent `tibetan` | parent `buddhist` (lineage) |
| *(new)* | `judaism`, `jain`, `sikh`, `daoist`, `contemporary`, `multi-tradition`, `nichiren`, `kashmir-shaivism`, … |

---

## Open questions

1. Bon: sibling of Tibetan (proposed) vs keep under Tibetan with clearer labeling?
2. Add place type `Retreat Center`, or rely on Center + offerings `retreats`?
3. `affiliationMode` on places vs encoding host-ness only via Multi-tradition tag?
4. Contemplative Christianity: keep scoped root, or rename to Christianity with contemplative-only editorial policy?
