# Pilgrimage route coverage gaps

Running checklist of canonical Buddhist / Hindu circuits versus what is in `src/data/pilgrimage.ts`.
Updated as external research batches arrive. Do not treat tourism blogs as sole authority — verify against Wikipedia / primary lists before implementing.

## How to use

- **Have** = route and core stops present
- **Partial** = route exists but missing major stops, or related sites only
- **Missing** = not in catalog yet
- Corrections to source batches are noted under each section

---

## Implemented from this doc (Jul 2026)

Priority items from Batches 1–3 were added to `src/data/pilgrimage.ts` (dynamic pages under `/pilgrimage/sites/[slug]` and `/pilgrimage/routes/[slug]`). Photos downloaded via `npm run download-pilgrimage-photos`.

### New / completed routes

| Route slug | Notes |
| --- | --- |
| `eight-great-places` | Classical 8 |
| `buddhas-walk` | Pragbodhi → Bodh Gaya → Sarnath |
| `sapta-puri` | True seven cities |
| `jyotirlinga-12` | All 12 (Vaidyanath = Deoghar) |
| `adi-shakti-peethas` | Kamakhya, Kalighat, Tara Tarini, Bimala |
| `pancha-bhoota` | Fire = Tiruvannamalai (corrected) |
| `ashta-vinayak` | All 8 Maharashtra Ganesha temples |
| `panch-kedar` | All 5 |
| `panch-prayag` | All 5 sangams |
| `kumbh-cities` | Prayagraj, Haridwar, Ujjain, Trimbakeshwar |
| `rama-circuit` | Ayodhya → Rameswaram anchors |
| `braj-krishna` | Braj + Dwarka + Kurukshetra |
| `govardhan-parikrama` | Hill circumambulation anchors |
| `narmada-parikrama` | Amarkantak → Omkareshwar → Maheshwar → Bharuch |
| `manimahesh-yatra` | Manimahesh Lake |
| `divya-desam-highlights` | Phased anchors + Muktinath (not all 108) |
| `arunachal-buddhist` | Bomdila → Tawang |

### Updated existing routes

- `chota-char-dham` — now Yamunotri, Gangotri, Kedarnath, Badrinath
- `buddhist-circuit-india` — + Devdaha, Ramgram, Pragbodhi, Kesariya
- `kathmandu-valley` — + Kopan, Pharping

### Still deferred (do not treat as done)

- Full 108 Divya Desam temple list
- Tōkai Hundred Kannon
- Full MoT state heritage trails / Deccan cave extras (Karla, Kanheri, …)
- Odisha Diamond Triangle, Lauriyas, Gaya-as-distinct-stop
- Navadurga, Dwadasha Aditya, Mumbai Panch Vinayak
- Padavedu–Velachery, Barbarika desert trail, unnamed J&K yatras
- Panch Kailash full set (only Manimahesh + Kailash Mansarovar exist)

---

## Batch 1 — Canonical Buddhist & Hindu circuits

Source: structured overview of major Buddhist/Hindu pilgrimage routes (agent research, Jul 2026).

### Buddhist

| Circuit | Status | In catalog | Gaps / notes |
| --- | --- | --- | --- |
| Four Great Sites (life of the Buddha) | Have | `four-great-sites` — Lumbini, Bodh Gaya, Sarnath, Kushinagar | Naming note: often mislabeled “Caturmahāpratihārya” (that term usually = four great *miracles*). Sites themselves are correct (Mahāparinibbāna Sutta). |
| Extended Buddhist Circuit (India & Nepal) | Partial | `buddhist-circuit-india` — also Kapilavastu, Shravasti, Rajgir, Nalanda, Vaishali, Sankassa, Vikramashila | Missing **Devdaha**, **Ramgram**. Those are historically real but **not** part of the classical Eight Great Places (Attha-mahathanani). |
| Eight Great Places (Attha-mahathanani) | Partial | All eight sites exist individually; no dedicated “eight places” route | Eight = Four Great + Shravasti, Rajgir, Sankassa, Vaishali. |
| Nepal Buddhist Circuit | Partial | `kathmandu-valley` — Swayambhu, Boudha, Golden Temple Patan, Pashupatinath, Namo Buddha, Lumbini | Missing **Kopan**, **Pharping**. |
| Shikoku 88 | Have | `shikoku-88` — all 88 temples | — |
| Tibetan kora (Kailash / Manasarovar) | Have | `kailash-kora` includes Manasarovar + Dirapuk + Kailash + Zutulpuk | No separate Manasarovar-only kora route (usually combined). |

### Hindu

| Circuit | Status | In catalog | Gaps / notes |
| --- | --- | --- | --- |
| Char Dham (Badrinath, Dwarka, Puri, Rameswaram) | Have | `hindu-char-dham` | — |
| Chota Char Dham | Partial | `chota-char-dham` — Kedarnath, Badrinath | Missing sites **Yamunotri**, **Gangotri** (currently only named conceptually). |
| Sapta Puri (7 sacred cities) | Missing / wrong shape | `hindu-sacred-cities` is a different mix (Varanasi, Mathura, Haridwar, Tirupati, Madurai, Pashupatinath) | Need true Sapta Puri: Ayodhya, Mathura, Haridwar, Kashi/Varanasi, Kanchipuram, Ujjain, Dwarka. Missing sites: **Ayodhya**, **Kanchipuram**, **Ujjain**. |
| 12 Jyotirlinga Yatra | Missing | Only Kedarnath, Varanasi (Kashi Vishwanath), Rameswaram as sites | Need full 12 + route. List in batch is correct; **Vaidyanath** has competing claims (Deoghar most common). |
| 51 Shakti Peethas | Missing | — | Counts vary (51/52/108). Useful first cut: 4 Adi Peethas — Kamakhya, Kalighat, Tara Tarini, Bimala (Puri). |
| Pancha Bhoota Stalam | Missing | — | **Correct Fire temple:** Arunachaleswarar / Annamalaiyar (**Tiruvannamalai**), not Chidambaram. Space = Thillai Nataraja (Chidambaram). Batch conflated Fire + Space at Chidambaram. |
| Ashta Vinayak (Maharashtra) | Missing | — | Eight Ganesha temples: Morgaon, Siddhatek, Pali, Mahad, Theur, Lenyadri, Ozar, Ranjangaon. |
| Panch Kedar | Missing | Kedarnath only | Need Tungnath, Rudranath, Madhyamaheshwar, Kalpeshwar. |
| Rama Circuit / Ramayana Trail | Missing | Partial sites only (Varanasi, Rameswaram) | Need Ayodhya, Chitrakoot, Prayagraj, Panchavati/Nashik; Lanka sites optional/cross-border. |
| Krishna / Braj Mandal | Missing | Mathura, Dwarka only | Need Vrindavan, Govardhan, Barsana, Gokul, Kurukshetra. |

### Site-level missing (from Batch 1)

```
Devdaha, Ramgram
Kopan, Pharping
Yamunotri, Gangotri
Ayodhya, Kanchipuram, Ujjain
Somnath, Mallikarjuna, Mahakaleshwar, Omkareshwar, Bhimashankar,
  Tryambakeshwar/Trimbakeshwar, Vaidyanath, Nageshwar, Grishneshwar
Kamakhya, Kalighat, Tara Tarini, Bimala
Ekambareswarar, Jambukeswarar, Arunachaleswarar (Tiruvannamalai),
  Srikalahasti, Chidambaram Nataraja
Morgaon, Siddhatek, Pali (Ballaleshwar), Mahad, Theur, Lenyadri, Ozar, Ranjangaon
Tungnath, Rudranath, Madhyamaheshwar, Kalpeshwar
Chitrakoot, Prayagraj, Panchavati/Nashik
Vrindavan, Govardhan, Barsana, Gokul, Kurukshetra
```

### Batch 1 source corrections (do not copy blindly)

1. Pancha Bhoota: Fire = Tiruvannamalai; Space = Chidambaram (not both Chidambaram).
2. Devdaha / Ramgram ≠ Eight Great Places.
3. “Buddhist Circuit” (India tourism) ≈ expanded Magadha–Nepal itinerary, not only the four life sites.
4. Shakti Peetha counts are traditional/variable; prefer a documented subset first.

---

## Batch 2 — Additional / regional circuits

Source: “additional circuits and regional routes” overview (agent research, Jul 2026). Deduped against Batch 1 and current catalog. Verified against PIB Ministry of Tourism releases, Wikipedia, and standard pilgrimage lists.

### Duplicates / already covered (skip as new routes)

| Claimed item | Verdict |
| --- | --- |
| Extended Sacred Circuit / “Retracing Buddha’s Footsteps” | **Near-dupe of Batch 1 extended circuit** + our `buddhist-circuit-india`. Real MoT “Circuit 2” (10–15 days). Adds tourism extras we lack (below), not a separate *canonical* life-of-Buddha list. |
| Saigoku / Bandō / Chichibu | **Already have** full routes (`saigoku-kannon`, `bando-33`, `chichibu-34`, `japan-100-kannon`). |
| Do Dham (Kedarnath + Badrinath) | **Dupe of `chota-char-dham` subset**. Not a new circuit — marketing shorthand for two of four Himalayan dhams. |
| Western India caves (Ajanta, Ellora, …) | **Partial have** — Ajanta, Ellora on `india-rock-cut`; Amaravati, Nagarjunakonda, Sanchi as sites. Missing Karla, Kanheri, Bhaja, etc. |
| Himalayan list items Samye, Ganden, Hemis | **Already have** those sites; the *blog “eight pilgrimages” framing* is not a single canonical route. |

### New / worth tracking (after research)

#### Buddhist

| Circuit | Status | Correctness | Catalog / gap |
| --- | --- | --- | --- |
| MoT Circuit 2 — Extended Dharmayatra | Partial (overlap) | **Confirmed** (PIB): Bodhgaya cluster (Nalanda, Rajgir, Barabar, Pragbodhi, Gaya); Patna cluster (Vaishali, Lauriya Nandangarh, Lauriya Areraj, Kesariya, Patna Museum); Sarnath; Kushinagar; Piprahwa/Kapilvastu, Shravasti, Sankisa; Lumbini day trip. | Have core life/teaching sites. **Missing:** Barabar Caves, Pragbodhi Hill, Gaya (as distinct stop), Lauriya Nandangarh, Lauriya Areraj, Kesariya. Note: Barabar is primarily **Ājīvika**, often bundled into Buddhist tourism. Patna Museum is a museum, not a pilgrimage shrine. |
| MoT Circuit 3 — Buddhist Heritage Trails (state circuits) | Missing as routes | **Confirmed** as tourism product (PIB lists ~12 states, not 11). Batch omitted **Arunachal** (Tawang, Bomdila). Batch wrongly filed **Sanchi / MP under “South India”** — MoT lists Madhya Pradesh separately (central India). **Borra Caves** are limestone tourist caves; nearby **Salihundam** is the real Buddhist site (PIB pairs both under Vizag). | Scattered sites only (Ajanta, Ellora, Amaravati, Nagarjunakonda, Sanchi, Hemis). Treat as **optional heritage layers**, not one national route — prefer curated regional routes (e.g. Odisha Diamond Triangle, Deccan caves). |
| “Eight Himalayan Buddhist pilgrimages” (blog set) | Missing / low priority | **Not a classical numbered circuit** — a modern curated list (Tsurphu, Samye, Ganden, Drak Yerpa; Mustang/Dolpo/Manang/Helambu; Bhutan valleys; Ladakh monasteries). Real places, weak as a single product route. | Have Samye, Ganden, Hemis. Missing most Ladakh peers, Bhutan, Nepal high valleys, Tsurphu, Drak Yerpa. |
| Tōkai Hundred Kannon | Missing | **Real and distinct** from Japan 100 Kannon. = Mino 33 + Owari 33 + Mikawa 33 + Toyokawa Inari (central Honshū). Batch correctly listed it separately from Saigoku/Bandō/Chichibu. | None of Tōkai temples in catalog. Lower priority than national Japan 100 (already complete). |

#### Hindu

| Circuit | Status | Correctness | Catalog / gap |
| --- | --- | --- | --- |
| 108 Divya Desam | Missing | **Canonical Sri Vaishnava circuit** (Alvar / Divya Prabandham). 106 earthly (105 India + Muktinath Nepal) + 2 celestial (Tirupparkadal, Paramapadam). Overlaps Tirupati, Dwarka, Badrinath, Mathura/Ayodhya area, etc. | Have Tirupati, Dwarka, Badrinath, Mathura. Missing vast TN/Kerala set + **Muktinath**. Implement as phased route (e.g. Chola Nadu cluster first), not all 108 at once. |
| Panch Prayag | Missing | **Correct list:** Vishnuprayag, Nandprayag, Karnaprayag, Rudraprayag, Devprayag (Alaknanda confluences). | No prayag sites yet. Natural companion to Char Dham / Chota Char Dham roads. |
| Dwadasha Aditya (12 Sun temples) | Missing / niche | **Local Kashi circuit** (Kashi Khand / Skanda Purana tradition), not an all-India yatra. Batch overstated geographic scope (“primarily around Varanasi” is right). | Only Varanasi as city-level site. Low priority unless doing deep Kashi layers. |
| Navadurga Yatra | Missing / weak | Forms of Durga are canonical; **temple-to-form mappings vary** by region/source. Not one stable national 9-temple list like Jyotirlinga. | Skip until a specific documented regional Navadurga set is chosen. |
| Kumbh Mela circuit (4 sites) | Missing | **Correct:** Prayagraj, Haridwar, Ujjain, Nashik–Trimbak on ~12-year rotation (UNESCO ICH). Not a walking circuit — a **rotating festival geography**. | Have Haridwar only. Need Prayagraj, Ujjain, Nashik (overlaps Batch 1 Sapta Puri / Jyotirlinga Trimbakeshwar). |
| Panch Vinayak Mumbai | Missing / local | Real **local one-day** Ganesha circuit; far smaller than Ashta Vinayak (Batch 1). | Skip or mark as Mumbai city layer after Ashta Vinayak. |
| Do Dham | Duplicate | See above — do not add as separate route. | Covered by expanding `chota-char-dham`. |

### Batch 2 site-level gaps (net-new, high value)

```
# MoT extended circuit extras
Barabar Caves, Pragbodhi Hill, Kesariya, Lauriya Nandangarh, Lauriya Areraj

# Deccan / heritage (if building regional routes)
Karla, Kanheri, Bhaja, Pitalkhora, Pandavleni
Ratnagiri, Lalitgiri, Udayagiri (Odisha), Dhauli
Salihundam (prefer over Borra for Buddhist)

# Himalaya / Himalayan Buddhism
Tsurphu, Drak Yerpa, Lamayuru, Alchi, Thikse, Likir, Shey, Spituk
Muktinath (also Divya Desam)
(Bhutan / Mustang / Dolpo — optional later)

# Hindu Batch 2
Vishnuprayag, Nandprayag, Karnaprayag, Rudraprayag, Devprayag
Prayagraj (Sangam), Nashik (Kumbh / Panchavati overlap)
```

### Batch 2 source corrections

1. **“11 states”** Heritage Trails → PIB lists **more** (includes Arunachal Pradesh).
2. **Sanchi is not South India** — Madhya Pradesh / central India state circuit.
3. **Borra Caves ≠ core Buddhist pilgrimage**; prefer Salihundam when mapping Andhra heritage.
4. **Tōkai 100 ≠ Japan 100 Kannon** — different temple sets; both real.
5. **Do Dham** is not additional to Chota Char Dham — it is a shorter subset.
6. **Extended Sacred Circuit** is a Ministry of Tourism product layered on the classical sites, not a second scriptural canon.
7. **Navadurga** and **Dwadasha Aditya** are real devotionally, but weak as pan-Indian “major routes” compared to Divya Desam / Panch Prayag / Kumbh geography.
8. Himalayan “eight pilgrimages” blog list ≠ one official circuit.

### Priority suggestion (Batch 1 + 2 combined)

1. Finish Hindu cores from Batch 1: Sapta Puri, Jyotirlinga, Chota Char Dham (Yamunotri/Gangotri), Pancha Bhoota, Ashta Vinayak, Panch Kedar.
2. Add **Panch Prayag** + **Kumbh four cities** (small, high recognition).
3. Expand Buddhist circuit with **Kesariya / Pragbodhi** (and optionally Lauriyas).
4. Phase **Divya Desam** (start with famous cluster, not all 108).
5. Defer: Tōkai 100, Mumbai Panch Vinayak, Navadurga, full MoT state trails, blog Himalayan octad.

---

## Batch 3 — Regional, thematic, “forgotten” / revived trails

Source: “additional … forgotten pilgrimage routes” overview (agent research, Jul 2026), citing Whatshot, PIB, Kashmir Life, EaseIndiaTrip. Deduped against Batches 1–2 and current catalog.

### Duplicates / already covered (skip)

| Claimed item | Verdict |
| --- | --- |
| Dharmayatra (Sacred Circuit) 5–7 day | **MoT Circuit 1** — shorter twin of Batch 2’s Extended Circuit / our `buddhist-circuit-india` + `four-great-sites`. Not a new canon. |
| Buddhist Heritage Trails — Arunachal & Kolkata museum | **Already flagged in Batch 2** (PIB includes Arunachal; Kolkata Indian Museum). Still missing from catalog as sites/routes. |
| Saigoku / Bandō / Chichibu / Tōkai 100 | **Dupes of Batches 1–2.** Have first three fully; Tōkai still missing (tracked). |
| Panch Kedar “lesser-known high-altitude trails” | **Not a new circuit** — trail variants of Batch 1 Panch Kedar. Track under Panch Kedar implementation, not a separate route. |
| Ramayana forest trails / Krishna Braj / Devi Shakti micro-circuits | **Overlap Batch 1** Rama Circuit, Krishna/Braj, Shakti Peethas. Micro-circuits are refinements, not net-new top-level routes. |
| Amarnath | **Already have** as site. |

### Source error in this batch

**Dharmayatra 5–7 day blurb wrongly pastes Extended Circuit stops.**  
PIB Circuit 1 (Sacred / Dharmayatra, 5–7 days) is: Bodhgaya; Varanasi (Sarnath); Kushinagar; Kapilvastu; Lumbini day trip.  
Nalanda / Rajgir / Barabar / Pragbodhi / Gaya cluster belongs to **Circuit 2 (Extended)**, not Circuit 1. Do not merge them when implementing.

### New / worth tracking

#### Buddhist

| Circuit | Status | Correctness | Notes |
| --- | --- | --- | --- |
| MoT Circuit 1 — Dharmayatra (core) | Partial / dupe shape | Confirmed PIB product | Same sites we largely have; optional short-route alias of existing Buddhist circuit. No new sites beyond Batch 2 extras. |
| Arunachal: Tawang, Bomdila | Missing | Real major Himalayan monasteries | High value if building NE India / Vajrayana layer. |
| Kolkata Indian Museum (Buddhist gallery) | Missing / skip as pilgrimage | Real museum hub | Better as optional “heritage stop” than a pilgrimage site. |
| “Buddha’s Walk” Bodh Gaya → Sarnath (~250 km) | Missing / research-revival | **Not an official MoT numbered circuit.** Scholar/walker reconstruction (e.g. Dubba excavations; independent cetiya-cārikā projects). Legend route is historically plausible; trail is fragmented under modern roads. | Model later as a **2-stop narrative route** (bodh-gaya → sarnath) or walking trail note — not a full stop list until waypoints are curated. |
| East Asian Kannon circuits | Partial | Real | Catalog already complete for Saigoku/Bandō/Chichibu; Tōkai still open (Batch 2). |

#### Hindu

| Circuit | Status | Correctness | Notes |
| --- | --- | --- | --- |
| **Narmada Parikrama** | Missing | **Major living pilgrimage** — ~2,600–3,200 km both banks, traditionally Amarkantak ↔ Bharuch (sea), river kept to the right. Months on foot. | High priority thematic route. Anchor sites: **Amarkantak**, Omkareshwar (have as Jyotirlinga gap), Maheshwar, Bharuch/Garudeshwar. River-parikrama, not a fixed temple count. |
| **Manimahesh Yatra** | Missing | **Confirmed** HP state-level Shiva yatra to Manimahesh Lake (Chamba), ~4,080 m; often called local “Kailash.” Official registration / seasonal. Also framed in **Panch Kailash** set (with Kailash Mansarovar, Kinnaur Kailash, Shrikhand, Adi Kailash). | Strong single-destination route: Hadsar → lake (+ Manimahesh Kailash peak as landmark). |
| Padavedu–Velachery Saivite network (TN) | Missing / low confidence | Lifestyle “forgotten routes” journalism; not a stable named national yatra | Defer until a documented temple list exists. |
| Barbarika / Khatu Shyam trail (RJ–GJ) | Missing / low confidence | Khatu Shyam pilgrimage is real; continuous “desert trail” framing is soft | Prefer **Khatu Shyam** as a site (+ related Barbarika lore) over inventing a multi-state trail. |
| J&K lesser yatras (unnamed) | Missing / too vague | Real regional yatras exist beyond Vaishno Devi / Amarnath | Need named list (e.g. specific lakes/caves) before tracking. Have Amarnath; **Vaishno Devi** still missing as site. |
| Govardhan / Braj micro-circuits | Missing | **Govardhan Parikrama is real and major** (~21 km; often described as ~7 kos). Batch’s “12-kos” likely confuses **12 km Badi Parikrama** with kos units. Vrindavan van-yatra also traditional. | Implement under Batch 1 Krishna/Braj — add Govardhan, Vrindavan as sites + optional `govardhan-parikrama` route. |
| Devi shakti regional subsets | Missing | Real regional clusters (Bengal/Assam/Odisha) | Same as Batch 1 Shakti Peethas — implement Adi Peethas / regional subset first. |

### Batch 3 site-level gaps (net-new, higher value)

```
Amarkantak, Maheshwar, Bharuch (Narmada mouth / Garudeshwar area)
Manimahesh Lake (Chamba)
Tawang, Bomdila
Vaishno Devi
Khatu Shyam (optional)
Govardhan (+ Vrindavan already in Batch 1 gaps)
```

### Batch 3 source corrections

1. Circuit 1 ≠ Circuit 2 stop list (see above).
2. Arunachal / Kolkata museum are **not “beyond” a separate new network** — they are part of the same PIB Heritage Trails list already covered in Batch 2.
3. Japan Kannon circuits are repeats; only **Tōkai** remains open.
4. “Buddha’s Walk” is revival/research, not a finished official trail product.
5. Govardhan is ~**21 km / ~7 kos**, not cleanly “12-kos.”
6. Padavedu–Velachery and Barbarika desert trail need stronger sources before productizing.
7. Narmada Parikrama and Manimahesh are the **strongest net-new Hindu items** in this batch.

### Updated priority suggestion (Batches 1–3)

1. Batch 1 Hindu cores (Sapta Puri, Jyotirlinga, Chota Char Dham finish, Pancha Bhoota, Ashta Vinayak, Panch Kedar).
2. **Narmada Parikrama** (anchor stops) + **Panch Prayag** + **Kumbh four cities**.
3. **Manimahesh** (+ optional Panch Kailash framing later).
4. Braj: Vrindavan + **Govardhan Parikrama**.
5. Buddhist: Kesariya / Pragbodhi; **Tawang**; Buddha’s Walk as narrative 2-point route.
6. Defer: forgotten TN/RJ trails, museum-as-pilgrimage, Navadurga, Tōkai 100, full 108 Divya Desam.

---

## Later batches

_(Append below as new lists arrive.)_
